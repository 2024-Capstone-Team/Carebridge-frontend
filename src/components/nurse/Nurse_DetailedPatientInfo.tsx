import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import search from "../../assets/search.png";
import back from "../../assets/back.png";

interface Nurse_DetailedPatientInfoProps {
    patientName: string;
    onBack: () => void; // 돌아가기 버튼 핸들러
  }

const NurseDetailedPatientInfo: React.FC<Nurse_DetailedPatientInfoProps> = ({ patientName, onBack }) => {
    return (
        /*환자 정보 전체 창*/
        <div className="bg-[#DFE6EC] p-3 rounded-lg relative">

            {/*백 로고, 환자 정보*/}
            <div>
                <img src={back} alt="back" className="w-[1.5em] h-[1.5em] mr-2 absolute -translate-x-4 -translate-y-6 " onClick={onBack}/>
                <h2 className="text-lg font-bold mb-4 absolute translate-x-2 -translate-y-7">환자 정보</h2>
            </div>

            {/*검색*/}    
            <div className="flex bg-white w-full mt-2 mb-3 px-1 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
                <img src={search} alt="search" className="w-[1.5em] h-[1.5em] mr-2"/>
                <input type="text" placeholder="환자 이름을 입력해주세요." className="w-60"/>
            </div>

            {/*환자 인적사항(이름 포함)*/}    
            <div className="mb-4">
                <h2 className="text-lg  font-semibold">홍길동 환자</h2>
                
                {/*환자 인적사항(이름 미포함)*/} 
                <div className="flex justify-between text-gray-500 my-1">
                    <p>생년월일</p>
                    <p>1999.12.01</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                    <p>성별</p>
                    <p>남</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                    <p>입원일</p>
                    <p>2024.11.29</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                    <p>병명</p>
                    <p>게실염</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                    <p>병동/호실</p>
                    <p>oo병동 o호실</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                    <p>전화번호</p>
                    <p>010-1234-1234</p>
                </div>
                <div className="flex justify-end mt-1">
                    <button className="bg-gray-300 border-gray-400 rounded-md border    text-center px-2 w-[50px]">채팅</button>
                </div>
            </div>
                

            <div>
                <h2 className="text-lg  font-semibold">요청 기록</h2>
                <p className="text-gray-500 my-1">2024.12.01</p>
                
                <div className="flex justify-between text-gray-500 my-1">
                    <p>진통제 투약</p>
                    <p>요청: 오전 11:40</p>
                </div>
                <p className="flex justify-end text-gray-500 my-1">완료: 오전 11:50</p>
                <hr className="bg-gray-500 my-1"></hr>
            </div>
            
        </div>
      );
}

export default NurseDetailedPatientInfo;