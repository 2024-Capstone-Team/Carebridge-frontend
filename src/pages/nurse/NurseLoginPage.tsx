import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import logo from "../../assets/carebridge_logo.png"
import stock from "../../assets/hospital stock.jpg"
import { useUserContext } from "../../context/UserContext"
import { motion } from "framer-motion"

const NurseLoginPage: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

  const [id, setID] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { setHospitalId } = useUserContext()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id.trim()) {
      alert("ID를 입력해주세요.")
      return
    }

    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.")
      return
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/staff/login`, {
        userId: id,
        password: password,
      })

      const hospitalIdFromResponse = response.data
      const hospitalIdStr = hospitalIdFromResponse.toString()

      setHospitalId(hospitalIdStr)
      localStorage.setItem("hospitalId", hospitalIdStr)

      navigate("/nurse-main")
    } catch (error) {
      console.error("로그인 실패:", error)
      alert("ID 또는 비밀번호가 잘못되었습니다.")
    }
  }

  return (
    <motion.div
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 사진 영역 */}
      <motion.div
        className="hidden w-[550px] max-w-2xl p-6 md:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative h-[500px] w-full overflow-hidden rounded-2xl">
          <img src={stock || "/placeholder.svg"} alt="병원 이미지" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-blue-600/20" />
          <div className="absolute bottom-8 left-8 max-w-md text-white">
            <h2 className="mb-2 text-2xl font-bold">CareBridge</h2>
            <p className="text-sm opacity-90">
              환자 케어의 새로운 기준을 제시합니다. <br></br>간호사 포털에 로그인하여 환자 관리를 시작하세요.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 로그인 영역 */}
      <motion.div
        className="w-full max-w-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          className="border-none bg-white/80 shadow-xl backdrop-blur-sm rounded-[20px] p-6 h-[500px] flex flex-col justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <img src={logo || "/placeholder.svg"} alt="CareBridge 로고" className="w-[150px]" />
          </motion.div>

          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">간호사 로그인</h2>

          <motion.form
            className="space-y-5"
            onSubmit={handleLogin}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="space-y-2">
              <label htmlFor="id" className="text-sm font-medium text-gray-700">
                병원 ID
              </label>
              <div className="relative">
                <input
                  id="id"
                  placeholder="병원 ID를 입력하세요"
                  value={id}
                  onChange={(e) => setID(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <button
                  type="button"
                  className="text-xs text-black hover:text-gray-400"
                  onClick={() => navigate("/nurse-find-password")}
                >
                  비밀번호 찾기
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                      <line x1="2" x2="22" y1="2" y2="22"></line>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 h-11 w-full rounded-xl bg-[#98B3C8] font-medium text-white hover:bg-[#DFE6EC] hover:text-black"
            >
              로그인
            </button>
          </motion.form>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default NurseLoginPage
