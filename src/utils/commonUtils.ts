// 만 나이 계산
export const calculateAge = (birthDateString: string): number | string => {
    if (!birthDateString) return "정보 없음";
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return "정보 없음";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const isBeforeBirthday =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
    if (isBeforeBirthday) age--;
    return age;
  };


  // 생년월일 포맷
  export const formatBirthdate = (birthdate: string | null | undefined) => {
    if (!birthdate) return "정보 없음";
    try {
      const trimmedDate = birthdate.split("T")[0];
      const [year, month, day] = trimmedDate.split("-");
      return year && month && day ? `${year}.${month}.${day}` : "정보 없음";
    } catch (error) {
      console.error("formatBirthdate 처리 중 에러:", error);
      return "정보 없음";
    }
  };
  
  
  // 성별 구분
  export const formatGender = (gender: string): string => {
    return gender === "Male" ? "남" : gender === "Female" ? "여" : "정보 없음";
  };


  // 시간 포맷
  export const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return "정보 없음";
    try {
      const dateObj = new Date(timeString);
      if (isNaN(dateObj.getTime())) return "정보 없음";
      return dateObj.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    } catch (error) {
      console.error("formatTime 처리 중 에러:", error);
      return "정보 없음";
    }
  };