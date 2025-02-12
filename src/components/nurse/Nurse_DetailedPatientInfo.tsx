import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import search from "../../assets/search.png";
import back from "../../assets/back.png";
import axios from "axios";

interface PatientInfo {
  patientId: number;
  name: string;
  birthDate: string;
  gender: string;
  hospitalizationDate: string;
  diagnosis: string;
  hospitalLocation: string;
  phoneNumber: string;
}

interface NurseDetailedPatientInfoProps {
  patientId: number; // 선택된 환자의 ID
  onBack: () => void; // 돌아가기 버튼 핸들러
}

const formatDate = (date: string | null | undefined): string => {
  if (!date) return "정보 없음";
  const isoDate = new Date(date);
  const year = isoDate.getFullYear();
  const month = String(isoDate.getMonth() + 1).padStart(2, "0");
  const day = String(isoDate.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const NurseDetailedPatientInfo: React.FC<NurseDetailedPatientInfoProps> = ({ patientId, onBack }) => {
  const navigate = useNavigate();

  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allPatients, setAllPatients] = useState<PatientInfo[]>([]);

  // 선택한 환자의 상세 정보 가져오기
  useEffect(() => {
    if (!patientId) {
      console.warn("유효하지 않은 환자 ID:", patientId);
      return;
    }
    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/patient/user/${patientId}`);
        console.log("환자 세부 정보:", response.data);
        setPatient(response.data);
      } catch (error) {
        console.error("환자 세부 정보를 가져오는 중 오류 발생:", error);
      }
    };
    fetchPatientDetails();
  }, [patientId]);

  // 검색에 사용할 전체 환자 목록 가져오기
  useEffect(() => {
    const fetchAllPatients = async () => {
      try {
        const staffId = 1; // 임시 staff_id 값
        const response = await axios.get(`http://localhost:8080/api/patient/users/${staffId}`);
        const fetchedPatients = response.data.map((p: any) => ({
          patientId: p.patientId,
          name: p.name,
          birthDate: p.birthDate,
          gender: p.gender,
          hospitalizationDate: p.hospitalizationDate,
          diagnosis: p.diagnosis,
          hospitalLocation: p.hospitalLocation,
          phoneNumber: p.phoneNumber,
        }));
        fetchedPatients.sort((a: PatientInfo, b: PatientInfo) =>
          a.name.localeCompare(b.name, "ko", { sensitivity: "base" })
        );
        setAllPatients(fetchedPatients);
      } catch (error) {
        console.error("환자 데이터를 가져오는 중 에러 발생:", error);
      }
    };
    fetchAllPatients();
  }, []);

  const fuse = new Fuse(allPatients, {
    keys: ["name"],
    threshold: 0.3,
  });

  const filteredPatients = searchQuery ? fuse.search(searchQuery).map(result => result.item) : [];

  return (
    <div className="h-full bg-[#DFE6EC] p-3 rounded-lg">
      <div className="flex relative mb-4">
        <img
          src={back}
          alt="back"
          className="w-[1.5em] h-[1.5em] mr-2 cursor-pointer absolute -translate-x-6 translate-y-1"
          onClick={onBack}
        />
        <h2 className="text-lg font-bold">환자 정보</h2>
      </div>

      {/* 검색 입력창 */}
      <div className="flex bg-white w-full mb-3 px-1 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
        <img src={search} alt="search" className="w-[1.5em] h-[1.5em] mr-2" />
        <input
          type="text"
          placeholder="환자 이름을 입력해주세요."
          className="w-60"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 검색어가 입력된 경우, 검색 결과 목록 표시 */}
      {searchQuery ? (
        <div className="space-y-4 h-[350px] overflow-y-auto">
          {filteredPatients.length > 0 ? (
            <ul className="space-y-4 w-full cursor-pointer">
              {filteredPatients.map((p) => (
                <li
                  key={p.patientId}
                  className="pb-2"
                  onClick={() => {
                    // 검색 결과 선택 시 검색어 초기화 후 상세정보 페이지로 이동
                    setSearchQuery("");
                    navigate(`/nurse/patient/${p.patientId}`);
                  }}
                >
                  <div className="text-base font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-600">
                    <span>
                      {formatDate(p.birthDate)} {p.gender === "Male" ? "남" : "여"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
          )}
        </div>
      ) : (
        // 검색어가 없으면 선택된 환자의 상세 정보 표시
        <>
          {!patient ? (
            <div className="text-gray-500 text-center">로딩 중...</div>
          ) : (
            <div className="overflow-y-auto h-[350px]">
              <div className="mb-1">
                <h2 className="text-lg font-semibold">{patient.name}</h2>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>생년월일</p>
                  <p>{formatDate(patient.birthDate)}</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>성별</p>
                  <p>{patient.gender === "Male" ? "남" : "여"}</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>입원일</p>
                  <p>{formatDate(patient.hospitalizationDate)}</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>병명</p>
                  <p>{patient.diagnosis || "정보 없음"}</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>위치</p>
                  <p>{patient.hospitalLocation || "정보 없음"}</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>전화번호</p>
                  <p>{patient.phoneNumber || "정보 없음"}</p>
                </div>
                <div className="flex justify-end mt-1">
                  <button className="bg-gray-300 border-gray-400 rounded-md border text-center px-2 w-[50px]">
                    채팅
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NurseDetailedPatientInfo;
