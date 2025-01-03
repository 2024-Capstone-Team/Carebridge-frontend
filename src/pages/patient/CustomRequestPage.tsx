import PatientChatHeader from "../../components/patient/PatientChatHeader";

const CustomRequestPage = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <PatientChatHeader
        title="커스텀 요청"
      />
    </div>
  );
};

export default CustomRequestPage;