import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/carebridge_logo.png"
import stock from "../../assets/hospital stock.jpg"
import axios from "axios"
import { motion } from "framer-motion"

const NurseFindPasswordPage: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

  const [id, setID] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleBackToLogin = () => {
    navigate("/nurse-login")
  }

  // 비밀번호 찾기
  const handleFindPassword = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/staff/find-password`, { params: { Id: id } })

      setPassword(response.data)
    } catch (error: any) {
      if (error.response) {
        alert(`비밀번호 찾기 실패: ${error.response.data}`)
      } else {
        alert(`비밀번호 찾기 실패: ${error.message}`)
      }
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
              환자 케어의 새로운 기준을 제시합니다. <br></br>비밀번호를 잊으셨나요? 병원 ID를 입력하여 찾으실 수
              있습니다.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 비밀번호 찾기 영역 */}
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
            <img
              src={logo || "/placeholder.svg"}
              alt="CareBridge 로고"
              className="w-[150px] cursor-pointer"
              onClick={handleBackToLogin}
            />
          </motion.div>

          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">비밀번호 찾기</h2>

          <motion.form
            className="space-y-5"
            onSubmit={(e) => e.preventDefault()}
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
                  onChange={(e) => {
                    setID(e.target.value)
                    setPassword("")
                  }}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleFindPassword}
              className="mt-6 h-11 w-full rounded-xl bg-[#98B3C8] font-medium text-white hover:bg-[#DFE6EC] hover:text-black"
            >
              비밀번호 확인
            </button>

            {password && (
              <motion.div
                className="mt-4 rounded-lg bg-blue-50 p-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-medium text-blue-800">
                  찾은 비밀번호: <span className="font-bold">{password}</span>
                </p>
              </motion.div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="mt-4 text-sm text-gray-600 hover:text-gray-900"
              >
                로그인 하기
              </button>
            </div>
          </motion.form>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default NurseFindPasswordPage
