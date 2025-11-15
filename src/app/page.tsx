'use client'
import DefaultExtension from "@/components/defaultExtension";
import AddIcon from "@/components/icons/addIcon";
import DeleteIcon from "@/components/icons/deleteIcon";
import { useToast } from "@/context/ToastContext";
import { extensions } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { Spin } from "antd";

export default function Home() {
  // 토스트 메시지
  const {showToast} = useToast();
  // 로딩 여부
  const [isLoading, setIsLoading] = useState(true);
  // 커스텀 확장자 입력 ref
  const extentionInputRef = useRef<HTMLInputElement>(null);

  // 최대 차단 개수
  const maxLength = 200;
  // 고정 확장자 목록
  const fixedExtensions = ['bat', 'cmd', 'com', 'cpl', 'exe', 'scr', 'js'];

  // 등록된 전체 확장자 목록(Set)
  const [totalExtensions, setTotalExtensions] = useState<Set<string>>(new Set());
  // 커스텀 확장자 길이
  const [customLength, setCustomLength] = useState<number>(0);

  // 첫 마운트 시 DB 불러오기
  useEffect(() => {
    fetchAllExtensions();
  }, []);

  // DB 상태로 State 동기화
  const fetchAllExtensions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/extensions');
      const data = await response.json();
      
      if (data.success && data.data) {
        const extensionNames = data.data.map((ext: extensions) => ext.extension_name);
        setTotalExtensions(new Set(extensionNames));
        setIsLoading(false);
        return true;
      } else {
        showToast('확장자 목록을 불러오는데 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      console.error('Fetch extensions error:', error);
      showToast('서버 오류가 발생했습니다.', 'error');
      return false;
    }
  };

  // 커스텀 확장자 길이 재계산
  useEffect(() => {
    const filtered = [...totalExtensions].filter(ext => !fixedExtensions.includes(ext));
    setCustomLength(filtered.length);
  }, [totalExtensions])

  // 고정 확장자 체크박스 토글 (등록/제거)
  const handleCheckbox: React.MouseEventHandler<HTMLSpanElement> = async (e) => {
    let ext = e.currentTarget.dataset.ext;
    if (!ext) return;
    ext = ext.toLowerCase();

    const isRegistered = totalExtensions.has(ext);

    if (isRegistered) {
      // DB에서 제거 - DELETE 요청
      try {
        const response = await fetch(`/api/extensions/${ext}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          showToast(data.message, 'info');
          // State 업데이트
          setTotalExtensions(prev => {
            const next = new Set(prev);
            next.delete(ext);
            return next;
          });
        } else {
          showToast(data.message, 'error');
          fetchAllExtensions();
        }
      } catch (error) {
        console.error('API Error:', error);
        showToast('서버 오류가 발생했습니다.', 'error');
      }
    } else {
      // DB 등록 - POST 요청
      try {
        const response = await fetch('/api/extensions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ extension_name: ext }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          showToast(data.message, 'info');
          // State 업데이트
          setTotalExtensions(prev => {
            const next = new Set(prev);
            next.add(ext);
            return next;
          });
        } else {
          showToast(data.message, 'error');
          fetchAllExtensions();
        }
      } catch (error) {
        console.error('API Error:', error);
        showToast('서버 오류가 발생했습니다.', 'error');
      }
    }
  };

  // 확장자 등록
  const handleAddExtension = async () => {
    const inputEl = extentionInputRef.current;
    if (!inputEl) return;
    const newExt = inputEl.value.trim().toLowerCase() || '';

    // 입력값 없음 검사
    if (!newExt) {
      showToast('확장자를 입력해주세요.', 'error');
      inputEl.focus();
      return;
    }

    // 유효하지 않은 입력값 검사 (영문 + 숫자만 허용)
    const extRegex = /^[a-z0-9]{1,20}$/;
    if (!extRegex.test(newExt)) {
      showToast('확장자는 영문과 숫자만 입력해주세요.', 'error');
      inputEl.focus();
      return;
    }

    // 중복 검사
    if (totalExtensions.has(newExt)) {
      showToast(`'${newExt}'는 이미 등록된 확장자입니다.`, 'error');
      return;
    }

    // 최대 개수(200) 검사
    if (customLength >= 200) {
      showToast(`커스텀 확장자는 ${maxLength}개를 초과할 수 없습니다.`, 'error');
      return;
    }

    try {
      // DB 등록 - POST 요청
      const response = await fetch('/api/extensions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extension_name: newExt }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast(data.message, 'info');
        // State 업데이트
        setTotalExtensions(prev => {
          const newSet = new Set(prev);
          newSet.add(newExt);
          return newSet;
        });
        inputEl.value = '';
      } else {
        showToast(data.message, 'error');
        fetchAllExtensions();
      }
    } catch (error) {
      console.error('API Error:', error);
      showToast('서버 오류가 발생했습니다.', 'error');
    }
  }

  // 확장자 제거
  const handleDeleteExtension = async ({ ext }: { ext: string }) => {
    try {
      // DB에서 제거 - DELETE 요청
      const response = await fetch(`/api/extensions/${ext}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast(data.message, 'info');
        // State 업데이트
        setTotalExtensions(prev => {
          const newSet = new Set(prev);
          newSet.delete(ext.toLowerCase());
          return newSet;
        });
      } else {
        showToast(data.message, 'error');
        fetchAllExtensions();
      }
    } catch (error) {
      console.error('API Error:', error);
      showToast('서버 오류가 발생했습니다.', 'error');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div
        className="
          absolute box-border w-[650px] top-[18%] rounded-[6px]
          shadow-[0_2px_5px_rgba(0,0,0,0.20)] bg-white py-[30px] px-[45px]
        "  
      >
        {/* header */}
        <div>
          <div className="pb-[7px] border-b border-gray-300">
            <h1 className="text-[18px] font-[600]">차단 확장자 관리</h1>
          </div>
          <ul className="py-[6px] px-[8px] mb-[15px] bg-gray-100/70 text-gray-600/95 text-[13px]">
            <li>• 업로드를 차단할 확장자를 등록합니다.</li>
            <li>• 최대 {maxLength}개까지 등록할 수 있습니다.</li>
          </ul>
        </div>
        {/* body */}
        {
          isLoading
            ? <div className="flex justify-center items-center w-full h-[280px] box-border">
                <Spin></Spin>
              </div>
            : (
              <div className="w-full h-[280px] box-border">
                {/* 고정 확장자 영역 */}
                <div className="flex items-center mb-[12px]">
                  <div className="w-[100px] shrink-0">
                    <span>고정 확장자</span>
                  </div>
                  <div className="flex">
                    {fixedExtensions.map((ext) => (
                      <DefaultExtension
                        key={ext}
                        totalExtensions={totalExtensions}
                        ext={ext}
                        handleCheckbox={handleCheckbox}
                      />
                    ))}
                  </div>
                </div>
                {/* 커스텀 확장자 영역 */}
                <div className="flex w-full">
                  <div className="w-[100px] shrink-0">
                    <span>커스텀 확장자</span>
                  </div>
                  <div className="flex flex-col w-full">
                    {/* 확장자 입력 */}
                    <div className="flex items-center h-[30px] mb-[12px]">
                      <input
                        ref={extentionInputRef}
                        className="
                          outline-none w-[200px] h-full py-[1px] px-[6px] mr-[5px]
                          border border-gray-400/89 rounded-[5px] focus:border-purple-600 focus:bg-purple-50/90 hover:border-purple-400 transition
                          text-[14px]"
                        type="text"
                        placeholder="확장자 입력 (예: sh)"
                        maxLength={20}
                        autoComplete="off"
                        spellCheck="false"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddExtension();
                        }}
                      ></input>
                      <button
                        type="button"
                        className="
                          flex items-center justify-center px-[5px] pr-[9px] w-[58px] h-full rounded-[3px]
                          bg-[#5b40f8] hover:bg-[#7163c3] text-white
                          cursor-pointer select-none
                        "
                        onClick={handleAddExtension}
                      >
                        <span className="flex items-center justify-center w-[15px] h-[15px] mr-[1px]">
                          <AddIcon strokeWidth={2} />
                        </span>
                        <span className="text-[13px]">추가</span>
                      </button>
                    </div>
                    {/* 커스텀 확장자 목록 */}
                    <div
                      className="h-full w-full border border-gray-400/89 rounded-[5px] mb-[10px]"
                    >
                      <div className="text-gray-500 text-[13px] font-[500] pt-[3px] pb-[2px] px-[5px]">
                        {customLength}/{maxLength}
                      </div>
                      <div className="w-full h-full">
                        {
                        customLength === 0
                          ? (<p className="relative text-center text-[13px] text-gray-500 top-[45px]">등록된 확장자가 없습니다.</p>)
                          : <div className="flex flex-wrap content-start box-border w-full h-[172px] overflow-y-auto p-[3px]">
                            {Array.from(totalExtensions).filter((ext) => !fixedExtensions.includes(ext)).sort().map((ext) => (
                              <div
                                key={ext}
                                className="
                                  flex items-center border border-gray-400 rounded-[5px]
                                  min-w-[43px] h-[23px] py-[0px] px-[3px] pl-[4px] mx-[3px] mb-[7px]
                                  text-[14px] cursor-default bg-purple-100/85
                                "
                              >
                                <span>{ext}</span>
                                <button
                                  type="button"
                                  className="w-[13px] h-[13px] ml-auto p-[0px] cursor-pointer rounded-[3px] hover:bg-red-100/70 transition hover:[&>svg]:text-red-600"
                                  onClick={() => {handleDeleteExtension({ext: ext})}}
                                >
                                  <DeleteIcon />
                                </button>
                              </div>
                            ))}
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
        }
      </div>
    </div>
  );
}
