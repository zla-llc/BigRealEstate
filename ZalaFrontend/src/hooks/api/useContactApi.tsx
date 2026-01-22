import type {
  APIHookProps,
  CreateContactProps,
  EditContactProps,
} from "./types";
import type { AContact } from "../../interfaces";
import { useFetch } from "./useFetch";

export const useContactApi = (props: APIHookProps) => {
  const { getSignal } = props;
  const { post, put, del } = useFetch();

  const createContact = async (body: CreateContactProps) => {
    return await post<AContact>(`/api/contacts`, body, {
      isFormData: false,
      signal: getSignal("createContact"),
    });
  };

  const editContact = async ({ newContact, ogContact }: EditContactProps) => {
    return await put<AContact>(
      `/api/contacts/${newContact.contactId}`,
      {
        contact_id: 0,
        first_name: newContact.firstName ?? ogContact.firstName,
        last_name: newContact.lastName ?? ogContact.lastName,
        email: newContact.email ?? ogContact.email,
        phone: newContact.phone ?? ogContact.phone,
      },
      {
        isFormData: false,
        signal: getSignal("editContact"),
      }
    );
  };

  const deleteContact = async ({ contactId }: { contactId: number }) => {
    return await del(`/api/contacts/${contactId}`, getSignal("deleteContact"));
  };

  return {
    createContact,
    editContact,
    deleteContact,
  };
};
