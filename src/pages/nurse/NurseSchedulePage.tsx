import React from "react";
import { useParams, useLocation } from "react-router-dom";
import NursePatientList from "../../components/nurse/Nurse_PatientList";
import NurseCalendar from "../../components/nurse/Nurse_Calendar";
import ScheduleEditForm from "../../components/nurse/Nurse_ScheduleEdit";

const NurseSchedulePage: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();

  return (
    <div className="flex h-screen bg-[#DFE6EC] overflow-hidden">
      <div className="w-1/5 rounded-lg">
        <NursePatientList />
      </div>
      
      <div className="flex-1 bg-white rounded-lg m-4 p-4">
        <ScheduleEditForm scheduleId={scheduleId} />
      </div>
    </div>
  );
};

export default NurseSchedulePage;
