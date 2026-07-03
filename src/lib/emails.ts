import type { Mailbox } from "@/lib/mailbox";

export type Attachment = {
  name: string;
  type: "pdf" | "xlsx" | "jpg" | "png" | "zip" | "docx";
  size: string;
  date: string;
  category: "document" | "image" | "spreadsheet" | "archive";
  previewUrl?: string;
};

export type ThreadMessage = {
  id: string;
  sender: string;
  email: string;
  avatar: string;
  avatarColor: string;
  time: string;
  body: string;
  showActions?: boolean;
  isMe?: boolean;
};

export type Email = {
  id: number;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  starred: boolean;
  unread: boolean;
  folder: Mailbox;
  attachment: { name: string; type: string } | null;
  highlighted: boolean;
  label?: string;
  recipient?: string;
  recipientEmail?: string;
  attachments?: Attachment[];
  messages?: ThreadMessage[];
  replyTo?: string;
  replyToEmail?: string;
};

const me = {
  sender: "You",
  email: "you@admincorp.com",
  avatar: "ME",
  avatarColor: "bg-primary",
};

export const initialEmails: Email[] = [
  {
    id: 1,
    sender: "Dev Pipeline System",
    subject: "Build Failed: Production API Gateway",
    preview:
      "build #4523 failed during the deployment phase. Please review the logs and retry the pipeline.",
    time: "10:45 AM",
    starred: false,
    unread: true,
    folder: "inbox",
    attachment: null,
    highlighted: false,
    replyToEmail: "jenkins@devpipeline.io",
    messages: [
      {
        id: "1",
        sender: "Dev Pipeline System",
        email: "jenkins@devpipeline.io",
        avatar: "DP",
        avatarColor: "bg-slate-600",
        time: "Today, 10:45 AM",
        body: "Build #4523 failed during the deployment phase for Production API Gateway. Please review the logs and retry the pipeline when the issue is resolved.",
      },
    ],
    replyTo: "Dev Pipeline System",
  },
  {
    id: 2,
    sender: "Google Team",
    subject: "Email Verification",
    preview:
      "Your Google account security settings have been updated. If this wasn't you, please review your account.",
    time: "09:12 AM",
    starred: false,
    unread: true,
    folder: "inbox",
    attachment: null,
    highlighted: true,
    replyToEmail: "no-reply@google.com",
    messages: [
      {
        id: "1",
        sender: "Google Team",
        email: "no-reply@google.com",
        avatar: "G",
        avatarColor: "bg-blue-500",
        time: "Today, 09:12 AM",
        body: "Your Google account security settings have been updated. If this wasn't you, please review your account immediately and secure your credentials.",
      },
    ],
    replyTo: "Google Team",
  },
  {
    id: 3,
    sender: "Admin Team Solutions",
    subject: "Q4 Quarterly Business Review - Draft Feedback & Strategy Document",
    preview:
      "Please find attached the finalized invoice for Q3 services. Payment is due within 30 days.",
    time: "Yesterday",
    starred: false,
    unread: false,
    folder: "inbox",
    attachment: { name: "security_report.pdf", type: "pdf" },
    highlighted: false,
    label: "Project Alpha",
    attachments: [
      {
        name: "Project_Proposal_v2.pdf",
        type: "pdf",
        size: "2.4 MB",
        date: "Oct 24, 2023",
        category: "document",
      },
      {
        name: "Q4_Strategy_Draft.pdf",
        type: "pdf",
        size: "2.4 MB",
        date: "Oct 24, 2023",
        category: "document",
      },
      {
        name: "Budget_Forecast_FY24.xlsx",
        type: "xlsx",
        size: "1.1 MB",
        date: "Oct 23, 2023",
        category: "spreadsheet",
      },
      {
        name: "Team_Sync_Photo.jpg",
        type: "jpg",
        size: "4.8 MB",
        date: "Oct 22, 2023",
        category: "image",
        previewUrl:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop",
      },
      {
        name: "Assets_Bundle.zip",
        type: "zip",
        size: "40.1 MB",
        date: "Oct 21, 2023",
        category: "archive",
      },
      {
        name: "Meeting_Notes.docx",
        type: "docx",
        size: "2.0 MB",
        date: "Oct 20, 2023",
        category: "document",
      },
    ],
    messages: [
      {
        id: "1",
        sender: "Junaid Hassan",
        email: "junaid.hassan@admincorp.com",
        avatar: "JH",
        avatarColor: "bg-indigo-500",
        time: "Oct 24, 2023, 10:15 AM",
        body: "Hi team,\n\nI've attached the initial draft for the Q4 review. Please take a look at the strategy.",
      },
      {
        id: "2",
        sender: "Junior Hillary",
        email: "junior.hillary@admincorp.com",
        avatar: "JH",
        avatarColor: "bg-emerald-500",
        time: "Oct 24, 2023, 2:30 PM",
        body: "Thanks Sarah. I've added my comments to the shared document. Overall it looks solid, but we might need to adjust the timeline for the marketing rollout. I also attached the latest budget forecast for reference.",
        showActions: true,
      },
    ],
    replyTo: "Junior Hillary",
    replyToEmail: "junior.hillary@admincorp.com",
  },
  {
    id: 4,
    sender: "Sarah Jenkins",
    subject: "Re: Marketing Assets Needed",
    preview:
      "Hi! Just checking in on the creative assets for the upcoming campaign. Let me know if you need anything else.",
    time: "Yesterday",
    starred: true,
    unread: false,
    folder: "inbox",
    attachment: null,
    highlighted: false,
    label: "Project Alpha",
    replyToEmail: "sarah.jenkins@admincorp.com",
    messages: [
      {
        id: "1",
        sender: "Sarah Jenkins",
        email: "sarah.jenkins@admincorp.com",
        avatar: "SJ",
        avatarColor: "bg-pink-500",
        time: "Yesterday, 3:20 PM",
        body: "Hi! Just checking in on the creative assets for the upcoming campaign. Let me know if you need anything else from the design team.",
        showActions: true,
      },
    ],
    replyTo: "Sarah Jenkins",
  },
  {
    id: 5,
    sender: "Figma",
    subject: "Design System Update",
    preview:
      "New components have been added to the global library. Review the changelog for breaking changes.",
    time: "Oct 12",
    starred: false,
    unread: false,
    folder: "inbox",
    attachment: null,
    highlighted: false,
    replyToEmail: "notifications@figma.com",
    messages: [
      {
        id: "1",
        sender: "Figma",
        email: "notifications@figma.com",
        avatar: "F",
        avatarColor: "bg-purple-500",
        time: "Oct 12, 11:00 AM",
        body: "New components have been added to the global library. Review the changelog for breaking changes before your next sync.",
      },
    ],
    replyTo: "Figma",
  },
  {
    id: 6,
    sender: "GitHub",
    subject: "Security alert for your repository",
    preview:
      "We detected a dependency with a known vulnerability in your main branch. Please update as soon as possible.",
    time: "Oct 11",
    starred: false,
    unread: false,
    folder: "inbox",
    attachment: null,
    highlighted: false,
    replyToEmail: "noreply@github.com",
    messages: [
      {
        id: "1",
        sender: "GitHub",
        email: "noreply@github.com",
        avatar: "GH",
        avatarColor: "bg-gray-800",
        time: "Oct 11, 8:45 AM",
        body: "We detected a dependency with a known vulnerability in your main branch. Please update as soon as possible to keep your repository secure.",
      },
    ],
    replyTo: "GitHub",
  },
  {
    id: 7,
    sender: "You",
    subject: "Re: Q4 Quarterly Business Review",
    preview: "Thanks for the update. I'll review the strategy document this afternoon.",
    time: "Yesterday",
    starred: false,
    unread: false,
    folder: "sent",
    recipient: "Junior Hillary",
    recipientEmail: "junior.hillary@admincorp.com",
    attachment: null,
    highlighted: false,
    messages: [
      {
        id: "1",
        sender: me.sender,
        email: me.email,
        avatar: me.avatar,
        avatarColor: me.avatarColor,
        time: "Yesterday, 4:15 PM",
        body: "Thanks for the update. I'll review the strategy document this afternoon and share feedback by EOD.",
        isMe: true,
      },
    ],
  },
  {
    id: 8,
    sender: "You",
    subject: "Team Offsite Planning — Save the Date",
    preview: "Hi team, marking calendars for the Q1 offsite. Please confirm availability...",
    time: "Oct 10",
    starred: false,
    unread: false,
    folder: "sent",
    recipient: "All Staff",
    recipientEmail: "all-staff@admincorp.com",
    attachment: null,
    highlighted: false,
    messages: [
      {
        id: "1",
        sender: me.sender,
        email: me.email,
        avatar: me.avatar,
        avatarColor: me.avatarColor,
        time: "Oct 10, 9:00 AM",
        body: "Hi team,\n\nMarking calendars for the Q1 offsite. Please confirm availability by Friday.\n\nBest,\nAdmin Team",
        isMe: true,
      },
    ],
  },
  {
    id: 9,
    sender: "You",
    subject: "Vendor Contract Review",
    preview: "Draft email to legal team regarding the updated vendor agreement terms...",
    time: "Draft",
    starred: false,
    unread: false,
    folder: "drafts",
    recipient: "Legal Team",
    recipientEmail: "legal@admincorp.com",
    attachment: null,
    highlighted: false,
    messages: [
      {
        id: "1",
        sender: me.sender,
        email: me.email,
        avatar: me.avatar,
        avatarColor: me.avatarColor,
        time: "Draft",
        body: "Hi Legal Team,\n\nPlease review the attached vendor agreement and let me know if the updated terms are acceptable.\n\nThanks,",
        isMe: true,
      },
    ],
  },
  {
    id: 10,
    sender: "You",
    subject: "Follow-up: Budget Approval",
    preview: "Following up on the budget request submitted last week...",
    time: "Draft",
    starred: false,
    unread: false,
    folder: "drafts",
    recipient: "Marcus Chen",
    recipientEmail: "marcus.chen@admincorp.com",
    attachment: null,
    highlighted: false,
    messages: [
      {
        id: "1",
        sender: me.sender,
        email: me.email,
        avatar: me.avatar,
        avatarColor: me.avatarColor,
        time: "Draft",
        body: "Hi Marcus,\n\nFollowing up on the budget request submitted last week. Could you provide an update on the approval status?",
        isMe: true,
      },
    ],
  },
  {
    id: 11,
    sender: "Newsletter Weekly",
    subject: "Your weekly digest — Oct edition",
    preview: "Top stories this week in tech and business...",
    time: "Oct 8",
    starred: false,
    unread: false,
    folder: "trash",
    attachment: null,
    highlighted: false,
    messages: [
      {
        id: "1",
        sender: "Newsletter Weekly",
        email: "digest@newsletter.io",
        avatar: "NW",
        avatarColor: "bg-orange-500",
        time: "Oct 8, 7:00 AM",
        body: "Top stories this week in tech and business. Click to read more...",
      },
    ],
  },
];

export function formatNowTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatNowDateTime(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
