export interface Option {
  id: string;
  title: string;
}

export interface Menu {
  header: string;
  body: string;
  options: Option[];
}

export interface Menus {
  [key: string]: Menu;
}

export interface UserInfo {
  name?: string;
  reason?: string;
  state: "collecting_name" | "collecting_reason" | "completed" | "none";
}

export interface MenuResponse {
  response: string;
  isInteractive: boolean;
  interactiveData: any | null;
  userInfo?: UserInfo;
}

export interface WhatsAppMessage {
  type: string;
  from: string;
  text?: {
    body: string;
  };
  interactive?: {
    type: string;
    button_reply: {
      id: string;
    };
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
  };
  video?: {
    id: string;
    mime_type: string;
    sha256: string;
  };
  audio?: {
    id: string;
    mime_type: string;
    sha256: string;
  };
  document?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename: string;
  };
  sticker?: {
    id: string;
    mime_type: string;
    sha256: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contacts?: {
    name: {
      formatted_name: string;
      first_name?: string;
      last_name?: string;
    };
    phones: Array<{
      phone: string;
      type?: string;
      wa_id?: string;
    }>;
  };
  system?: {
    body: string;
    identity?: string;
    new_wa_id?: string;
  };
}

export interface WebhookBody {
  object: string;
  entry: Array<{
    changes: Array<{
      value: {
        messages: WhatsAppMessage[];
        metadata: {
          phone_number_id: string;
        };
      };
    }>;
  }>;
}
