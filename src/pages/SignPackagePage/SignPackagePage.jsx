import React from "react";
import { useSignPackage } from "../../hooks/Signature/useSignPackage";
import SignPackageLayout from "../../layouts/SignPackageLayout";

const SignPackagePage = ({ theme, toggleTheme }) => {
  // Panggil Hook untuk mendapatkan Logic & State
  const hookData = useSignPackage();

  // Render Layout dengan menyebarkan (spread) semua data dari hook
  // plus props tema
  return <SignPackageLayout {...hookData} theme={theme} toggleTheme={toggleTheme} />;
};

export default SignPackagePage;
