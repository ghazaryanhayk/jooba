import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ItemGroup } from '../ui/item';
import { CandidateItem, type CandidateProps } from '../common/candidate-item';

const MOCK_CANDIDATES: CandidateProps[] = [
  { name: 'Elisa Murazik', title: 'Machine Learning Engineer', company: 'Alphabet', bio: 'Exploring the Vibrant Streets of Manhattan, NY' },
  { name: 'Jordan Heller', title: 'Software Engineer', company: 'Google', bio: 'Uncovering Hidden Gems in NYC' },
  { name: 'Sophie Ramirez', title: 'Data Scientist', company: 'DeepMind', bio: 'Living the New York Experience: A City Like No Other' },
  { name: 'Miles Cummings', title: 'Applied Scientist', company: 'Google', bio: 'The Pulse of New York: A Journey Through the City' },
  { name: 'Tara Rodriguez', title: 'Software Engineer', company: 'Google', bio: 'From Times Square to Central Park: NYC Adventures Await' },
  { name: 'Liam Rios', title: 'Research Scientist', company: 'Google', bio: 'New York City: Where Dreams Meet Reality' },
  { name: 'Nina Baker', title: 'Machine Learning Engineer', company: 'Google', bio: 'Exploring New York: A City Full of Stories' },
  { name: 'Owen Patel', title: 'Software Engineer', company: 'Google', bio: 'Navigating the Bustling Life of New York, NY' },
  { name: 'Maya Hunter', title: 'Data Analyst', company: 'Google', bio: 'Discovering the Heart of New York City' },
  { name: 'Ethan Lee', title: 'Machine Learning Engineer', company: 'Waymo', bio: 'The Magic of New York: A City That Never Sleeps' },
  { name: 'Zoe Kim', title: 'Software Engineer', company: 'Google', bio: 'A Day in the Life of New York: Culture and Excitement' },
  { name: 'Isaac Wong', title: 'Research Engineer', company: 'Google', bio: 'Discovering the Soul of New York City' },

  { name: 'Harper Tran', title: 'Backend Developer', company: 'Amazon', bio: 'Mastering Cloud Solutions from Seattle, WA' },
  { name: 'Lucas Silva', title: 'Frontend Engineer', company: 'Meta', bio: 'Creating Responsive UIs in Palo Alto, CA' },
  { name: 'Ava Dubois', title: 'AI Researcher', company: 'OpenAI', bio: 'Innovating Ethical AI from San Francisco, CA' },
  { name: 'Noah Cohen', title: 'Full Stack Engineer', company: 'Uber', bio: 'Bridging Frontend and Backend in NYC' },
  { name: 'Mila Bianchi', title: 'Data Engineer', company: 'Netflix', bio: 'Transforming Data Pipelines in Los Gatos, CA' },
  { name: 'Oliver Schmidt', title: 'DevOps Engineer', company: 'Spotify', bio: 'Orchestrating Deployments in Stockholm, Sweden' },
  { name: 'Isabella Rossi', title: 'QA Analyst', company: 'Airbnb', bio: 'Ensuring Quality Experiences in SF, CA' },
  { name: 'William Park', title: 'Security Engineer', company: 'Microsoft', bio: 'Securing Digital Worlds in Redmond, WA' },
  { name: 'Gianna Russo', title: 'UI/UX Designer', company: 'Figma', bio: 'Designing Interfaces in NYC' },
  { name: 'James Edwards', title: 'Product Manager', company: 'Stripe', bio: 'Launching Fintech Products in San Francisco, CA' },
  { name: 'Sophia Kim', title: 'Machine Learning Engineer', company: 'Tesla', bio: 'Driving AI Innovation in Austin, TX' },
  { name: 'Daniel Müller', title: 'Cloud Solutions Architect', company: 'SAP', bio: 'Architecting Systems in Berlin, Germany' },

  { name: 'Emma Johansson', title: 'Data Scientist', company: 'Spotify', bio: 'Sound Analytics from Stockholm, Sweden' },
  { name: 'Henry Walker', title: 'Mobile Developer', company: 'Snap', bio: 'Building Social Apps in Santa Monica, CA' },
  { name: 'Layla Carter', title: 'Business Analyst', company: 'Salesforce', bio: 'Analyzing Markets in San Francisco, CA' },
  { name: 'Finn O’Sullivan', title: 'Site Reliability Engineer', company: 'Twitter', bio: 'Scaling Systems in San Francisco, CA' },
  { name: 'Lily Dupont', title: 'Product Designer', company: 'Pinterest', bio: 'Pinning Ideas in San Francisco, CA' },
  { name: 'Ben Williams', title: 'Platform Engineer', company: 'Netflix', bio: 'Streaming Solutions in Los Gatos, CA' },
  { name: 'Mason Lee', title: 'AI Product Lead', company: 'Google', bio: 'Leading AI Teams in Mountain View, CA' },
  { name: 'Chloe Dubois', title: 'Data Privacy Specialist', company: 'Apple', bio: 'Protecting Privacy in Cupertino, CA' },
  { name: 'Rafael Costa', title: 'Front End Lead', company: 'Shopify', bio: 'eCommerce Experiences in Ottawa, Canada' },
  { name: 'Leo Campbell', title: 'Infrastructure Engineer', company: 'GitHub', bio: 'Enabling Dev Collaboration in SF, CA' },
  { name: 'Hannah Fischer', title: 'AI Solutions Engineer', company: 'IBM', bio: 'Engineering Cognitive Services in NY' },
  { name: 'Carter Evans', title: 'Entrepreneur in Residence', company: 'Y Combinator', bio: 'Incubating Startups in Mountain View, CA' },

  { name: 'Sofia Meyer', title: 'Blockchain Engineer', company: 'Coinbase', bio: 'Revolutionizing Finance from NYC' },
  { name: 'Jackson Lee', title: 'VR/AR Developer', company: 'Meta', bio: 'Building Immersive Realities in Menlo Park, CA' },
  { name: 'Emily Knight', title: 'DevRel Advocate', company: 'Twilio', bio: 'Championing Devs Across the Globe' },
  { name: 'Mateo Moreno', title: 'Robotics Engineer', company: 'Boston Dynamics', bio: 'Innovating Robotics in Boston, MA' },
  { name: 'Aurora D’Amico', title: 'Cloud Engineer', company: 'Oracle', bio: 'Cloud Infrastructure from Redwood City, CA' },
  { name: 'Jack Brown', title: 'Data Visualization Specialist', company: 'Tableau', bio: 'Visualizing Data in Seattle, WA' },
  { name: 'Victoria Smith', title: 'Growth Marketer', company: 'Dropbox', bio: 'Scaling Growth in San Francisco, CA' },
  { name: 'Julian Rossi', title: 'Support Engineer', company: 'Zendesk', bio: 'Customer Experience in Dublin, Ireland' },
  { name: 'Michelle Lin', title: 'Technical Writer', company: 'Atlassian', bio: 'Crafting Docs in Sydney, Australia' },
  { name: 'Oscar Petrov', title: 'Cloud Native Engineer', company: 'Red Hat', bio: 'Open Source in Raleigh, NC' },
  { name: 'Harley King', title: 'Penetration Tester', company: 'Veracode', bio: 'Security Testing in Burlington, MA' },
  { name: 'Penelope Reed', title: 'ML Platform Engineer', company: 'Hugging Face', bio: 'Empowering ML Research in Paris, France' }
];

export function CandidateList() {
  return (
    <div className="">
      <div className="flex items-center justify-end gap-2 px-4 py-2 h-11 border-gray-200 shrink-0">
        <span className="text-xs text-muted-foreground">
          Previewing <span className="font-medium text-foreground">100</span> out of{' '}
          <span className="font-medium text-foreground">10,000</span>
        </span>
        <Button size="sm" variant="default">
          Run full search
        </Button>
      </div>

      <ScrollArea className="flex-1 border-t border-gray-200 h-[calc(100vh-101px)]">
        <ItemGroup className="p-1 gap-1">
          {MOCK_CANDIDATES.map((candidate) => (
            <CandidateItem key={candidate.name} {...candidate} />
          ))}
        </ItemGroup>
      </ScrollArea>
    </div>
  );
}
