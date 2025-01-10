// src/pages/PatientLoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";

const PatientLoginPage: React.FC = () => {
  const [phone_num, setPhoneNum] = useState("");
  const navigate = useNavigate();
  const { setUserId } = useUserContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (phone_num === "") {
      const userData = { id: "patient123"}; // temp user id for testing, will need to call api later
      setUserId(userData.id); // set userID context
      navigate("/choose-patient-type");
    } else {
      alert("등록된 전화번호가 아닙니다.");
    }
  };

  return (
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
          style={{ fontSize: 13, fontFamily: "TAEBAEKfont", marginTop: -70 }}
        >
          환자&보호자용 로그인
        </h1>
        <form
          className="space-y-4 flex flex-col items-center"
          onSubmit={handleLogin}
          style={{ margin: 80, width: 250 }}
        >
          <div
            className="flex items-center"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div
              className="phone-container w-[110%] px-2 py-2"
              style={{
                display: "flex",
                fontSize: 13,
                borderRadius: 10,
                border: "1.5px solid #000000",
                marginLeft: 0,
                height: 40,
                width: 180,
              }}
            >
              <label
                htmlFor="phone-number"
                style={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  marginLeft: 5,
                }}
              >
                전화번호
              </label>
              <input
                type="tel"
                id="phone-number"
                value={phone_num}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="px-2 py-2"
                style={{
                  marginLeft: 10,
                  marginTop: -2,
                  fontSize: 13,
                  borderRadius: 30,
                  height: 25,
                  width: 100,
                }}
              />
            </div>
            <button
              style={{
                whiteSpace: "nowrap",
                fontSize: 13,
                height: 40,
                width: 85,
                fontFamily: "SUITE-Regular",
                fontWeight: "bold",
              }}
            >
              인증받기
            </button>
          </div>

          <div
            className="authorize-password px-2 py-2"
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              borderRadius: 10,
              border: "1.5px solid #000000",
              marginLeft: 0,
              height: 40,
              width: 275,
            }}
          >
            <label
              htmlFor="phone-number"
              style={{
                fontWeight: "bold",
                whiteSpace: "nowrap",
                marginLeft: 5,
                fontFamily: "TAEBAEKfont",
              }}
            >
              인증번호
            </label>
            <input
              style={{
                width: 200,
                marginLeft: 10,
                marginTop: -2,
                fontSize: 13,
                borderRadius: 30,
                height: 25,
              }}
            ></input>
          </div>

          <button
            type="submit"
            style={{ width: 90, height: 40, fontWeight: "bold" }}
          >
            LOG IN
          </button>
        </form>

        <div
          style={{
            fontSize: 12,
            marginTop: -60,
            color: "#BDBDBD",
            textDecoration: "underline",
            textDecorationColor: "#BDBDBD",
          }}
        >
          회원가입
        </div>

        <hr
          style={{
            border: "1px solid #BDBDBD",
            width: "90%",
            marginTop: "120px",
            marginBottom: 30,
          }}
        />
        <form style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ fontSize: 12, marginTop: 8 }}>소셜 로그인</div>
          <img
            src="public\icons\kakaotalk-icon.png"
            className="w-[12%] h-auto object-cover"
            style={{
              marginLeft: 20,
              borderRadius: 10,
            }}
          ></img>
        </form>
      </div>
    </div>
  );
};

export default PatientLoginPage;
