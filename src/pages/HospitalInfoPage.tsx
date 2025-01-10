// test file
import React, { useEffect, useState } from 'react';
import { fetchHospitalInfo } from '../services/hospitalService';

interface HospitalInfo {
  id: number;
  hospitalId: number;
  category: string;
  title: string;
  information: string;
}

const HospitalInfoPage: React.FC = () => {
  const [hospitalInfo, setHospitalInfo] = useState<HospitalInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHospitalInfo = async () => {
      try {
        const data = await fetchHospitalInfo();
        setHospitalInfo(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    loadHospitalInfo();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Hospital Information</h1>
      <ul>
        {hospitalInfo.map((info) => (
          <li key={info.id}>
            <h2>{info.title}</h2>
            <p><strong>Category:</strong> {info.category}</p>
            <p>{info.information}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HospitalInfoPage;