import { Button, ButtonVariant } from "../buttons";
import { Icons } from "../icons";
import { TextInput, RichTextEditor } from "../inputs";
import { Modal, type ModalProps } from "./Modal";
import type { ILead } from "../../interfaces";
import { useEmailModal } from "../../hooks";

type EmailModalProps = ModalProps & {
  leads: ILead[];
  onSendEmail?: (leads: ILead[]) => void;
};

export const EmailModal = ({
  open,
  leads,
  onClose,
  onSendEmail,
}: EmailModalProps) => {
  const {
    subject,
    setSubject,
    from,
    setFrom,
    body,
    setBody,
    signature,
    setSignature,
    loading,
    loadingSignature,
    onSubmit,
  } = useEmailModal({ leads, onSendEmail });

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full h-full p-6 flex flex-col justify-between">
        <div className="space-y-[5px]">
          <h2 className="text-2xl font-bold text-secondary">
            Email Lead{leads.length > 1 ? "s" : ""}
          </h2>
          <p className="text-secondary-50 text-sm line-clamp-2">
            Send an email to{" "}
            {leads.slice(0, Math.min(leads.length, 3)).map((lead) => (
              <span className="font-bold text-secondary">{`${
                lead.contact.firstName
              } ${lead.contact.lastName} (${
                lead.contact.email ?? lead.contact.phone
              })`}</span>
            ))}{" "}
            {leads.length > 3 ? `+${leads.length - 3} more` : ""}
          </p>
        </div>

        <div className="space-y-[15px]">
          <TextInput
            label="Subject"
            value={subject}
            setValue={setSubject}
            icon={Icons.Txt}
          />
          <TextInput
            label="From Name"
            value={from}
            setValue={setFrom}
            icon={Icons.User}
          />
          <RichTextEditor label="Body" value={body} onChange={setBody} />
          <div className="space-y-1">
            <label className="text-secondary text-sm font-semibold">
              Signature {loadingSignature && <span className="text-xs text-gray-400">(loading...)</span>}
            </label>
            <div
              className="rounded-[15px] border-2 border-secondary bg-white p-3 text-secondary text-sm focus-within:border-accent"
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setSignature((e.target as HTMLDivElement).innerHTML)}
              dangerouslySetInnerHTML={{ __html: signature }}
            />
          </div>
        </div>

        <div className="flex flex-row space-x-[15px]">
          <Button
            text={"Cancel"}
            onClick={onClose}
            variant={ButtonVariant.Secondary}
            disabled={loading}
          />
          <Button
            text={loading ? "Sending..." : "Send Campaign"}
            onClick={onSubmit}
            disabled={loading}
            icon={Icons.Mail}
          />
        </div>
      </div>
    </Modal>
  );
};
