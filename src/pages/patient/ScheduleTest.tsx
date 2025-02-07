import React, { useState, useEffect } from "react";
import axios from "axios";

interface Schedule {
  id: number;
  patientId: number;
  medicalStaffId: number;
  scheduleDate: string;
  details: string;
  code: string;
}

const ScheduleTest: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 호출
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/api/schedule/patient/1098765432");
        setSchedules(response.data);
        setError(null);
      } catch (err) {
        setError("스케줄 데이터를 불러오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // 로딩 중 표시
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 에러 표시
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">스케줄 테스트 페이지</h1>
      {schedules.length === 0 ? (
        <p>스케줄 데이터가 없습니다.</p>
      ) : (
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">환자 ID</th>
              <th className="border border-gray-300 px-4 py-2">의료진 ID</th>
              <th className="border border-gray-300 px-4 py-2">날짜</th>
              <th className="border border-gray-300 px-4 py-2">세부사항</th>
              <th className="border border-gray-300 px-4 py-2">코드</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="border border-gray-300 px-4 py-2">{schedule.id}</td>
                <td className="border border-gray-300 px-4 py-2">{schedule.patientId}</td>
                <td className="border border-gray-300 px-4 py-2">{schedule.medicalStaffId}</td>
                <td className="border border-gray-300 px-4 py-2">{schedule.scheduleDate}</td>
                <td className="border border-gray-300 px-4 py-2">{schedule.details}</td>
                <td className="border border-gray-300 px-4 py-2">{schedule.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ScheduleTest;
