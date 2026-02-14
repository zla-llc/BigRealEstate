import { useState } from "react";
import { useErrors } from "../utils";

export const useSignupState = () => {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [errors, setErrors] = useErrors();

  // Email verification state
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  return {
    userName,
    setUserName,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    rePassword,
    setRePassword,
    errors,
    setErrors,
    verificationStep,
    setVerificationStep,
    verificationCode,
    setVerificationCode,
    emailVerified,
    setEmailVerified,
    sendingCode,
    setSendingCode,
    verifyingCode,
    setVerifyingCode,
  };
};
