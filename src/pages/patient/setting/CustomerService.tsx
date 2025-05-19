import React from "react";
import { Link } from "react-router-dom";

const CustomerService: React.FC = () => {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <div className="flex flex-col min-h-screen bg-white p-4">
            {/* 상단 헤더 */}
            <div className="relative flex items-center p-2 w-full">
                <Link to="/patient-setting" className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <img src="/src/assets/back.png" alt="뒤로가기" className="w-[28px]" />
                </Link>
                <div className="flex-grow flex items-center justify-center">
                    <h1 className="text-lg font-semibold text-black">고객센터</h1>
                </div>
            </div>

            {/* 자주 묻는 질문 카드 */}
            <div className="flex flex-col items-center p-0 w-full max-w-md h-auto bg-white border-2 border-[#e6e6e6] rounded-[30px] shadow-lg mx-auto mt-4 overflow-y-auto">
                <div className="flex flex-col w-full p-7">
                    <h2 className="text-gray-600 text-xl font-medium mb-4">자주 묻는 질문</h2>
                    {[
                        {
                            question: "푸시 알림 설정은 이렇게 하면 돼요",
                            answer: "설정 > 알림 > CareBridge 앱을 선택한 후 알림 허용을 켜주세요.",
                        },
                        {
                            question: "로그인이 안 돼요",
                            answer: "앱을 완전히 종료한 후 다시 실행하거나, 인터넷 연결 상태를 확인해주세요. 문제가 지속될 경우 고객센터로 문의해주세요.",
                        },
                        {
                            question: "정보 수정은 어디서 하나요?",
                            answer: "내 정보 > 프로필 수정 메뉴에서 이름, 연락처 등의 정보를 수정할 수 있습니다.",
                        },
                    ].map((faq, index) => (
                        <div key={index} className="mb-3">
                            <button
                                onClick={() =>
                                    setOpenIndex(openIndex === index ? null : index)
                                }
                                className="w-full text-left text-black text-base font-medium flex justify-between items-center"
                            >
                                {faq.question}
                                <span className="text-gray-500">
                                    {openIndex === index ? "▲" : "▼"}
                                </span>
                            </button>
                            {openIndex === index && (
                                <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 이메일 문의 섹션 */}
            <div className="flex justify-center mt-4">
                <div className="bg-[#DFE6EC] border border-[#e6e6e6] rounded-[30px] p-4 w-full max-w-md text-center shadow-lg">
                    <p className="text-black text-base">
                        이메일 문의:{" "}
                        <a href="mailto:hanyangcarebridge@gmail.com" className="text-blue-600 underline">
                            hanyangcarebridge@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CustomerService;