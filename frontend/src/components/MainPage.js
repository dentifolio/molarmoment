import React from 'react';
import Layout from './Layout';
import PatientSearch from './PatientSearch';

const MainPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Find an Open Dentist</h1>
        <PatientSearch />
      </div>
    </Layout>
  );
};

export default MainPage;