import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/carebridge_logo.png"
import axios from "axios"
import { motion } from "framer-motion"

const NurseResetPasswordPage: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

  const [id, setID] = useState("")
  const [oldPassword, setOldPassword] = useState("") // 현재 비밀번호
  const [newPassword, setNewPassword] = useState("") // 새 비밀번호
  const [confirmPassword, setConfirmPassword] = useState("") // 새 비밀번호 확인
  const navigate = useNavigate()

  const handleResetPassword = async () => {
    // 비밀번호 일치 검사
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.")
      return
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/staff/reset-password?newPassword=${newPassword}`, {
        userId: id,
        password: oldPassword,
      })

      console.log("서버 응답:", response.data)
      alert("비밀번호가 성공적으로 변경되었습니다! 새 비밀번호로 다시 로그인해주세요.")

      navigate("/nurse-login")
    } catch (error: any) {
      if (error.response) {
        alert(`비밀번호 재설정 실패: ${error.response.data}`)
      } else {
        alert(`비밀번호 재설정 실패: ${error.message}`)
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        className="w-[600px] rounded-[20px] bg-white shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center pt-8">
          <img src={logo} alt="CareBridge 로고" className="w-[170px] cursor-pointer" onClick={() => navigate("/nurse-main")}/>
        </div>

        <h2 className="mb-8 mt-6 text-center text-2xl font-bold">비밀번호 재설정</h2>

        <div className="px-12 pb-8">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label htmlFor="id" className="text-gray-700" style={{ fontSize: "var(--font-body)" }}>
                병원 ID
              </label>
              <input
                id="id"
                placeholder="병원 ID를 입력하세요"
                value={id}
                onChange={(e) => setID(e.target.value)}
                className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="oldPassword" className="text-gray-700" style={{ fontSize: "var(--font-body)" }}>
                현재 비밀번호
              </label>
              <input
                id="oldPassword"
                type="password"
                placeholder="현재 비밀번호를 입력하세요"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-gray-700" style={{ fontSize: "var(--font-body)" }}>
                새 비밀번호
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="새 비밀번호를 입력하세요"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-gray-700" style={{ fontSize: "var(--font-body)" }}>
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="새 비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <button
              type="button"
              onClick={handleResetPassword}
              className="mt-4 h-12 w-full rounded-lg bg-[#98B3C8] font-medium text-white hover:bg-[#7a9ab2]"
            >
              비밀번호 변경
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/nurse-login")}
                className="mt-4 text-sm text-gray-600 hover:text-gray-900"
              >
                로그인 페이지로 돌아가기
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default NurseResetPasswordPage
