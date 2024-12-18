import React from 'react';
import PatientMessaging from '../../components/patient/PatientMessaging';

const PatientMainPage: React.FC = () => {
    return (
        <main className="centered-container">
            {/* Messaging Component */}
            <section>
            <h2>Messages</h2>
            <PatientMessaging />
            </section>
        </main>
    );
}

export default PatientMainPage;