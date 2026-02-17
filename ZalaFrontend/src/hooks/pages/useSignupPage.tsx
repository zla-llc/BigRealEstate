import { useEffect } from "react";
import {
  useAppNavigation,
  useAuthUser,
  useGoogleAuthButtonCallback,
  useSnack,
} from "../utils";
import {
  AContactToIContact,
  AUserToIUser,
  type IContact,
} from "../../interfaces";
import { useApi } from "../api";
import { stringify } from "../../utils";
import { useSignupState } from "../state";

export const useSignupPage = () => {
  const { toLoginPage } = useAppNavigation();
  const {
    createContact,
    createUser,
    linkContactToUser,
    sendVerificationCode,
    verifyCode,
  } = useApi();
  const loginUser = useAuthUser();
  const [successMsg, errorMsg] = useSnack();
  const googleAuthCallback = useGoogleAuthButtonCallback({
    onMsg: (user) => `Account created! Hello, ${user.contact?.firstName}`,
  });

  const state = useSignupState();
  const {
    userName,
    firstName,
    lastName,
    email,
    phone,
    password,
    rePassword,
    errors,
    setErrors,
    verificationStep,
    setVerificationStep,
    verificationCode,
    emailVerified,
    setEmailVerified,
    setSendingCode,
    setVerifyingCode,
  } = state;

  useEffect(() => {
    if (Object.keys(errors).length != 0) setErrors({});
  }, [userName, firstName, lastName, email, phone]);

  // Reset verification when email changes
  useEffect(() => {
    if (verificationStep) {
      setVerificationStep(false);
      setEmailVerified(false);
    }
  }, [email]);

  const isCreateAccountValid = (): [boolean, { [key: string]: string }] => {
    if (userName.trim().length === 0)
      return [false, { userName: "Missing user name" }];
    if (email.trim().length === 0) return [false, { email: "Missing email" }];
    if (firstName.trim().length === 0)
      return [false, { firstName: "Missing first name" }];
    if (lastName.trim().length === 0)
      return [false, { lastName: "Missing last name" }];
    if (phone.trim().length === 0) return [false, { phone: "Missing phone" }];
    if (password.trim().length === 0)
      return [false, { password: "Missing password" }];
    if (rePassword.trim().length === 0)
      return [false, { rePassword: "Missing repeat password" }];
    if (password !== rePassword)
      return [
        false,
        { passwordEquals: "Password and repeat password must be the same" },
      ];
    return [true, {}];
  };

  const onCreateClick = () => {
    const [isValid, validationErrors] = isCreateAccountValid();
    setErrors(validationErrors);
    if (!isValid) return;

    // If email not yet verified, send verification code first
    if (!emailVerified) {
      (async () => {
        setSendingCode(true);
        const res = await sendVerificationCode({ email });
        setSendingCode(false);

        if (res.err || !res.data) {
          errorMsg("Failed to send verification code. Please try again.");
          return;
        }

        successMsg(`Verification code sent to ${email}`);
        setVerificationStep(true);
      })();
      return;
    }

    // Email already verified — proceed with account creation
    (async () => {
      const user = await signupV1({
        userName,
        email,
        firstName,
        lastName,
        phone,
        password,
      });
      if (!user) return;

      successMsg(`Account created! Hello, ${user.contact?.firstName}`);
      loginUser(user);
    })();
  };

  const onVerifyCode = () => {
    if (verificationCode.trim().length === 0) {
      setErrors({ verificationCode: "Please enter the code" });
      return;
    }

    (async () => {
      setVerifyingCode(true);
      const res = await verifyCode({ email, code: verificationCode });
      setVerifyingCode(false);

      if (res.err || !res.data || !res.data.verified) {
        setErrors({ verificationCode: "Invalid or expired code" });
        return;
      }

      setEmailVerified(true);
      setVerificationStep(false);
      successMsg("Email verified! Creating your account...");

      // Automatically create the account now
      const user = await signupV1({
        userName,
        email,
        firstName,
        lastName,
        phone,
        password,
      });
      if (!user) return;

      successMsg(`Account created! Hello, ${user.contact?.firstName}`);
      loginUser(user);
    })();
  };

  const onResendCode = () => {
    (async () => {
      setSendingCode(true);
      const res = await sendVerificationCode({ email });
      setSendingCode(false);

      if (res.err || !res.data) {
        errorMsg("Failed to resend code. Please try again.");
        return;
      }
      successMsg(`New verification code sent to ${email}`);
    })();
  };

  const signupV1 = async (
    body: Omit<IContact, "contactId"> & { userName: string; password: string }
  ) => {
    const contactRes = await createContact({
      email: body.email,
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone,
    });

    if (contactRes.err || !contactRes.data) {
      console.log(`Internal error - Contact: ${stringify(contactRes)}`);
      const detail = contactRes.err || "Unknown error";
      if (detail.toLowerCase().includes("email already exists") || detail.toLowerCase().includes("phone already exists")) {
        errorMsg(detail);
      } else {
        errorMsg("Failed to create contact — email or phone may already be in use.");
      }
      return;
    }

    const contact = AContactToIContact(contactRes.data);
    const blankUserRes = await createUser({
      username: body.userName,
      password: body.password,
      profile_pic: "",
      role: "user",
    });

    if (blankUserRes.err || !blankUserRes.data) {
      console.log(`Internal error - User: ${stringify(blankUserRes)}`);
      const detail = blankUserRes.err || "Failed to create user";
      errorMsg(detail);
      return;
    }

    const userRes = await linkContactToUser({
      contactId: contact.contactId,
      userId: blankUserRes.data.user_id,
    });

    if (userRes.err || !userRes.data) {
      console.log(`Internal error - Connection: ${stringify(userRes)}`);
      console.log(``);
      errorMsg("Internal error - please try again later");
      return;
    }

    const user = AUserToIUser(userRes.data);
    return user;
  };

  const onLoginClick = () => {
    toLoginPage();
  };

  return {
    state,

    onCreateClick,
    onLoginClick,
    onVerifyCode,
    onResendCode,
    googleAuthCallback,
  };
};
