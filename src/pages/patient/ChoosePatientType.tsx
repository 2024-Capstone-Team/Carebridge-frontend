import React from "react";

const ChoosePatientType: React.FC = () => {
  return (
    <main className="centered-container">
      <div
        className="flex items-center justify-center min-h-screen bg-gray-100"
        style={{ padding: 40 }}
      >
        <div
          className="bg-white p-3 rounded-lg shadow-lg w-80 flex-col flex items-center"
          style={{
            minHeight: "90vh",
          }}
        >
          <img
            src="public\icons\icon-192x192.png"
            className="w-[80%] h-auto object-cover"
            style={{ padding: 1 }}
          ></img>
          <h1
            className="font-bold text-center mb-6"
            style={{ fontSize: 13, fontFamily: "TAEBAEKfont" }}
          >
            <div style={{ lineHeight: "1.8", fontSize: 15 }}>
              OOO님, 환영합니다. <br></br>
              서비스를 이용하는 대상을 골라주세요.
            </div>
          </h1>
          <button
            type="submit"
            className="patienttype1"
            style={{ width: 260, height: 45, fontSize: 16, marginTop: 20 }}
          >
            환자
          </button>
          <button
            type="submit"
            className="patienttype2"
            style={{ width: 260, height: 45, fontSize: 16, margin: 20 }}
          >
            보호자
          </button>
        </div>
      </div>
    </main>
  );
};

export default ChoosePatientType;
