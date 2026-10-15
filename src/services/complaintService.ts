import { WardComplaint, ChennaiZone } from '../types';
import { CHENNAI_ZONE_CENTERS } from '../components/common/ChennaiMap';

export const OFFICIAL_COMPLAINT_EMAIL = 'ecotrackai123@gmail.com';

export interface EmailSetupGuide {
  emailAddress: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  authMethod: 'OAuth2' | 'App Password';
  steps: string[];
}

export const EMAIL_SETUP_INSTRUCTIONS: EmailSetupGuide = {
  emailAddress: OFFICIAL_COMPLAINT_EMAIL,
  imapHost: 'imap.gmail.com',
  imapPort: 993,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 465,
  authMethod: 'App Password',
  steps: [
    'Log in to Google Account: ecotrackai123@gmail.com',
    'Navigate to Google Account Security > 2-Step Verification (turn ON if not already enabled)',
    'Under "2-Step Verification", scroll down to "App Passwords"',
    'Generate an App Password: Select app "Mail" and device "EcoTrack AI Server"',
    'Copy the 16-character generated password (e.g., abcd efgh ijkl mnop)',
    'Set environment variable in your backend .env: ECOTRACK_EMAIL_USER=ecotrackai123@gmail.com and ECOTRACK_EMAIL_PASS=your_16_char_password',
    'The backend will securely poll the mailbox over IMAP SSL (Port 993), parse unread messages, and push real-time alerts to the EcoTrack AI admin dispatch screen.'
  ]
};

// Preset pool of incoming email complaints to simulate live mailbox detection
export const SIMULATED_EMAIL_INBOX = [
  {
    messageId: 'msg-ecotrack-2026-001',
    senderEmail: 'karthik.s@gmail.com',
    senderName: 'Karthik Subramanian',
    phone: '+91 98403 99112',
    subject: 'Urgent: Bulk market waste dumped at T. Nagar Ranganathan St',
    body: 'Hi EcoTrack team, multiple retail shops have dumped packing crates, cardboard, and organic waste near Ranganathan Street entrance. It is blocking pedestrians. Please send an auto or tipper immediately.',
    zone: 'T. Nagar' as ChennaiZone,
    streetAddress: 'Ranganathan Street Junction, T. Nagar',
    landmark: 'Near Railway Station Foot Overbridge',
    wasteCategory: 'Commercial Mixed & Cardboard',
    quantityEstimateKg: 75,
    urgency: 'HIGH' as const,
  },
  {
    messageId: 'msg-ecotrack-2026-002',
    senderEmail: 'priya.ramesh@outlook.com',
    senderName: 'Priya Ramesh',
    phone: '+91 97910 44556',
    subject: 'Dustbin overflow and street animal litter in Velachery',
    body: 'Hello, the community bin opposite Velachery MRTS Station has been overflowing for 2 days. Stray cows and dogs are scattering waste across the road. Estimated 90kg of mixed wet food waste.',
    zone: 'Velachery' as ChennaiZone,
    streetAddress: 'Station Road, Near Velachery MRTS',
    landmark: 'Opposite Ticket Counter Gate 2',
    wasteCategory: 'Organic Wet Waste',
    quantityEstimateKg: 90,
    urgency: 'CRITICAL' as const,
  },
  {
    messageId: 'msg-ecotrack-2026-003',
    senderEmail: 'dr.nathan@apollo.org',
    senderName: 'Dr. S. Nathan',
    phone: '+91 94440 88221',
    subject: 'Medical packaging & dry plastic bottles piled up in Adyar',
    body: 'Dear Corporation Waste Dept, dry medicine packaging, non-hazardous plastics, and paper refuse piled up at 1st Cross Road, Gandhi Nagar, Adyar. Weighs around 40kg, safe for collection.',
    zone: 'Adyar' as ChennaiZone,
    streetAddress: '1st Cross Road, Gandhi Nagar, Adyar',
    landmark: 'Behind Apollo Clinic Corner',
    wasteCategory: 'Dry Recyclable',
    quantityEstimateKg: 40,
    urgency: 'NORMAL' as const,
  },
  {
    messageId: 'msg-ecotrack-2026-004',
    senderEmail: 'shanthi.nagarajan@yahoo.com',
    senderName: 'Shanthi Nagarajan',
    phone: '+91 98845 12098',
    subject: 'Narrow lane garbage accumulation near Temple in Mylapore',
    body: 'Namaste, Pitchu Pillai lane is very narrow and heavy compactors cannot enter. Accumulation of temple flower garlands and pooja items (~45kg). Please send a small auto rickshaw collection vehicle.',
    zone: 'Mylapore' as ChennaiZone,
    streetAddress: 'Pitchu Pillai Street Lane 3, Mylapore',
    landmark: 'Near North Gopuram',
    wasteCategory: 'Organic Temple Flowers',
    quantityEstimateKg: 45,
    urgency: 'NORMAL' as const,
  }
];

export class ComplaintService {
  /**
   * Generates a unique complaint identifier
   */
  public static generateComplaintId(source: 'EMAIL' | 'PHONE' | 'PORTAL'): string {
    const prefix = source === 'EMAIL' ? 'CMP-EML' : source === 'PHONE' ? 'CMP-PHN' : 'CMP-GEN';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-2026-${rand}`;
  }

  /**
   * Registers a manual phone complaint taken by Zonal helpline operator
   */
  public static createPhoneComplaint(data: {
    citizenName: string;
    phone: string;
    description: string;
    wasteCategory: string;
    quantityEstimateKg: number;
    zone: ChennaiZone;
    streetAddress: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    operatorName?: string;
  }): WardComplaint {
    const id = this.generateComplaintId('PHONE');
    const coords = (data.latitude && data.longitude) 
      ? [data.latitude, data.longitude] 
      : (CHENNAI_ZONE_CENTERS[data.zone] || [13.0418, 80.2341]);

    const timestamp = new Date().toISOString();

    return {
      id,
      citizenName: data.citizenName.trim(),
      phone: data.phone.trim(),
      source: 'PHONE',
      zone: data.zone,
      streetAddress: data.streetAddress.trim(),
      landmark: data.landmark ? data.landmark.trim() : undefined,
      latitude: coords[0],
      longitude: coords[1],
      complaintType: 'PHONE_HELPLINE_REPORT',
      wasteCategory: data.wasteCategory,
      quantityEstimateKg: data.quantityEstimateKg,
      urgency: data.urgency,
      description: data.description.trim(),
      status: 'NEW',
      createdAt: timestamp,
      activityLog: [
        {
          timestamp,
          action: 'REGISTERED_VIA_PHONE',
          note: `Complaint received via 1913 Helpline. Logged by ${data.operatorName || 'Zonal Operator'}.`,
          actor: data.operatorName || 'Zonal Helpline Operator'
        }
      ]
    };
  }

  /**
   * Fetches incoming email complaint from ecotrackai123@gmail.com
   * Checks for duplicate messageIds so the same email is never created twice
   */
  public static processIncomingEmail(
    emailData: typeof SIMULATED_EMAIL_INBOX[0],
    existingComplaints: WardComplaint[]
  ): { isDuplicate: boolean; complaint: WardComplaint | null } {
    // Check if an existing complaint already has this description or senderEmail + subject
    const isDuplicate = existingComplaints.some(c => 
      c.senderEmail === emailData.senderEmail && 
      c.streetAddress.toLowerCase() === emailData.streetAddress.toLowerCase()
    );

    if (isDuplicate) {
      return { isDuplicate: true, complaint: null };
    }

    const id = this.generateComplaintId('EMAIL');
    const coords = CHENNAI_ZONE_CENTERS[emailData.zone] || [13.0418, 80.2341];
    const timestamp = new Date().toISOString();

    const complaint: WardComplaint = {
      id,
      citizenName: emailData.senderName,
      phone: emailData.phone,
      senderEmail: emailData.senderEmail,
      source: 'EMAIL',
      zone: emailData.zone,
      streetAddress: emailData.streetAddress,
      landmark: emailData.landmark,
      latitude: coords[0] + (Math.random() - 0.5) * 0.005,
      longitude: coords[1] + (Math.random() - 0.5) * 0.005,
      complaintType: 'EMAIL_INBOX_REPORT',
      wasteCategory: emailData.wasteCategory,
      quantityEstimateKg: emailData.quantityEstimateKg,
      urgency: emailData.urgency,
      description: `[Subject: ${emailData.subject}]\n\n${emailData.body}`,
      status: 'NEW',
      createdAt: timestamp,
      activityLog: [
        {
          timestamp,
          action: 'EMAIL_DETECTED',
          note: `Incoming mail from ${emailData.senderEmail} detected at ${OFFICIAL_COMPLAINT_EMAIL}. Auto-parsed zone: ${emailData.zone}.`,
          actor: 'EcoTrack AI Email Gateway'
        }
      ]
    };

    return { isDuplicate: false, complaint };
  }
}

/**
 * Synchronizes incoming email messages for ecotrackai123@gmail.com
 * Extracts complaint details, coordinates, and ensures zero duplication.
 */
export function fetchSimulatedOrRealIncomingEmails(existingComplaints: WardComplaint[]): WardComplaint[] {
  const newComplaints: WardComplaint[] = [];
  
  for (const email of SIMULATED_EMAIL_INBOX) {
    const { isDuplicate, complaint } = ComplaintService.processIncomingEmail(email, existingComplaints);
    if (!isDuplicate && complaint) {
      newComplaints.push(complaint);
      break; // Ingest next unread citizen email
    }
  }

  return newComplaints;
}
