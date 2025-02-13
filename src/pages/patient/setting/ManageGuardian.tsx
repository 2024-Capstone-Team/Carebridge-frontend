import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUserContext } from '../../../context/UserContext';

// Guardian 인터페이스 정의
interface Guardian {
    guardianId?: string;
    name: string;
    patientId: number;
    phoneNumber: string;
}

const ManageGuardian: React.FC = () => {
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showAddGuardianModal, setShowAddGuardianModal] = useState(false);
    const [newGuardianName, setNewGuardianName] = useState('');
    const [newGuardianPhoneNumber, setNewGuardianPhoneNumber] = useState('');
    const { userId } = useUserContext();

    const fetchGuardians = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/guardian/list/${userId}`);
            setGuardians(response.data);
        } catch (error) {
            console.error('보호자 목록 불러오기 실패:', error);
            setErrorMessage('보호자 목록을 불러오는 데 실패했습니다.');
        }
    };

    useEffect(() => {
        fetchGuardians();
    }, [userId]);

    const handleDisconnect = (guardian: Guardian) => {
        setSelectedGuardian(guardian);
        setShowModal(true);
    };

    const confirmDisconnect = async () => {
        try {
            if (selectedGuardian) {
                await axios.delete(`http://localhost:8080/api/guardian/${selectedGuardian.phoneNumber}`);
                setGuardians(guardians.filter(g => g.phoneNumber !== selectedGuardian.phoneNumber));
                setShowModal(false);
            }
        } catch (error) {
            console.error('보호자 삭제 실패:', error);
            setErrorMessage('보호자 연결을 끊는 데 실패했습니다.');
        }
    };

    const cancelDisconnect = () => {
        setShowModal(false);
    };

    const handleAddGuardian = () => {
        setShowAddGuardianModal(true);
    };

    const confirmAddGuardian = async () => {
        try {
            await axios.post(
                `http://localhost:8080/api/guardian/${userId}`,
                { name: newGuardianName, phoneNumber: newGuardianPhoneNumber},
                { headers: { "Content-Type": "application/json" } }
            );

            setShowAddGuardianModal(false);
            setNewGuardianName('');
            setNewGuardianPhoneNumber('');
            fetchGuardians(); // 보호자 등록 후 목록을 다시 가져옴
        } catch (error) {
            console.error('보호자 등록 실패:', error);
            setErrorMessage('보호자 등록에 실패했습니다.');
        }
    };

    const cancelAddGuardian = () => {
        setShowAddGuardianModal(false);
        setNewGuardianName('');
        setNewGuardianPhoneNumber('');
    };

    return (
        <div className="flex flex-col min-h-screen bg-white p-4">
            {/* 상단 헤더 */}
            <div className="relative flex items-center p-2 w-full">
                <Link to="/patient-setting" className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <img src="src/assets/back.png" alt="뒤로가기" className="w-[28px]" />
                </Link>
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-bold text-black">보호자 관리</p>
                </div>
                <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#747474] text-white px-2 py-1 rounded-lg"
                    onClick={handleAddGuardian}
                >
                    보호자 등록
                </button>
            </div>

            {/* 에러 메시지 표시 */}
            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* 보호자 리스트 */}
            <div className="flex flex-col items-center p-0 w-full max-w-md bg-white border-2 border-[#e6e6e6] rounded-[30px] shadow-lg mx-auto mt-4">
                {guardians.map((guardian, index) => (
                    <div key={guardian.guardianId} className="flex flex-col w-full border-b border-gray-300 p-7">
                        <p className="text-[#747474] text-[20px]">보호자 {index + 1}</p>
                        <div className="flex justify-between items-center my-3">
                            <div>
                                <p className="text-black text-[20px]">이름</p>
                                <p className="text-black text-[20px] mt-2">전화번호</p>
                            </div>
                            <div className="text-right">
                                <p className="text-black text-[20px]">{guardian.name}</p>
                                <p className="text-black text-[20px] mt-2">{guardian.phoneNumber}</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-1">
                            <button className="text-[#747474] underline" onClick={() => handleDisconnect(guardian)}>
                                연결 끊기
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 연결 끊기 팝업 */}
            {showModal && selectedGuardian && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white text-black p-4 rounded-lg shadow-lg w-10/12 max-w-xs">
                        <p className="text-[5vw] font-bold">연결된 보호자 삭제</p>
                        <p className="text-[3vw] text-[#878E9C]">삭제하면 복구할 수 없습니다. 정말로 삭제하시겠습니까?</p>
                        <div className="flex justify-end mt-4">
                            <button className="bg-[#408AEC] text-white py-1.5 px-4 rounded-lg mr-3" onClick={confirmDisconnect}>
                                확인
                            </button>
                            <button className="bg-white text-black py-1.5 px-4 rounded-lg border" onClick={cancelDisconnect}>
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 보호자 등록 팝업 */}
            {showAddGuardianModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white text-black p-4 rounded-lg shadow-lg w-10/12 max-w-xs">
                        <p className="text-[5vw] font-bold">보호자 등록</p>
                        <input type="text" placeholder="이름" value={newGuardianName} onChange={(e) => setNewGuardianName(e.target.value)} className="w-full p-2 mt-2 border rounded bg-white" />
                        <input type="text" placeholder="전화번호" value={newGuardianPhoneNumber} onChange={(e) => setNewGuardianPhoneNumber(e.target.value)} className="w-full p-2 mt-2 border rounded bg-white" />
                        <div className="flex justify-end mt-4">
                            <button className="bg-[#747474] text-white py-1.5 px-4 rounded-lg mr-3" onClick={confirmAddGuardian}>확인</button>
                            <button className="bg-white text-black py-1.5 px-4 rounded-lg border" onClick={cancelAddGuardian}>취소</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageGuardian;