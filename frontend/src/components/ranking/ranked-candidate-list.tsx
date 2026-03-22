import { Button } from '@/components/ui/button';
import { ItemGroup } from '@/components/ui/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CandidateItem, type CandidateProps } from '../common/candidate-item';

const MOCK_RANKED_CANDIDATES: CandidateProps[] = [
  {
    name: 'Elisa Murazik', title: 'Data Scientist', company: 'Netflix', headline: 'Passionate about data-driven solutions and insights.',
    summary: 'Passionate about data-driven solutions and insights.',
    tier: 'A',
    status: { approved: true, reason: 'Data-driven analyst experienced in leveraging data for impactful decisions.' },
  },
  {
    name: 'Jordan Heller', title: 'Product Manager', company: 'Amazon', headline: 'Experienced product leader, driving innovation at scale.',
    summary: 'Experienced product leader, driving innovation at scale.',
    tier: 'A',
    status: { approved: true, reason: 'Adept at transforming complex data into actionable strategies. Excels in identifying trends and providing key insights.' },
  },
  {
    name: 'Sophie Ramirez', title: 'UX Designer', company: 'Google', headline: 'Creative UX designer focused on user-centered experiences.',
    summary: 'Creative UX designer focused on user-centered experiences.',
    tier: 'B',
    status: { approved: true, reason: 'Adept at translating complex data sets into clear, actionable insights. A strong background in statistical modeling.' },
  },
  {
    name: 'Tara Rodriguez', title: 'Software Engineer', company: 'Apple', headline: 'From Times Square to Central Park: NYC Adventures Await',
    summary: 'From Times Square to Central Park: NYC Adventures Await',
    tier: 'B',
    status: { approved: true, reason: 'Experienced in developing predictive models and machine learning algorithms. Passionate about leveraging data.' },
  },
  {
    name: 'Nina Baker', title: 'Project Manager', company: 'Spotify', headline: 'Project manager adept at delivering complex projects on time.',
    summary: 'Project manager adept at delivering complex projects on time.',
    tier: 'C',
    status: { approved: true, reason: 'Adept at identifying opportunities for business growth. Strong analytical and problem-solving skills.' },
  },
  {
    name: 'Owen Patel', title: 'Backend Engineer', company: 'Slack', headline: 'Navigating the Bustling Life of New York, NY',
    summary: 'Navigating the Bustling Life of New York, NY',
    tier: 'D',
    status: { approved: true, reason: 'Experienced in collaborating with cross-functional teams. Excellent communication and presentation skills.' },
  },
  {
    name: 'Maya Hunter', title: 'Frontend Developer', company: 'Adobe', headline: 'Discovering the Heart of New York City',
    summary: 'Discovering the Heart of New York City',
    tier: 'F',
    status: { approved: false, reason: 'Skilled in data governance and quality assurance. Committed to maintaining data integrity and accuracy.' },
  },
  {
    name: 'Ethan Lee', title: 'Cloud Architect', company: 'IBM', headline: 'The Magic of New York: A City That Never Sleeps',
    summary: 'The Magic of New York: A City That Never Sleeps',
    tier: 'F',
    status: { approved: false, reason: "Tara's profile lacks specific achievements and quantifiable results, making it difficult to assess their impact." },
  },
  {
    name: 'Zoe Kim', title: 'Account Executive', company: 'Salesforce', headline: 'Salesforce expert driving customer success through innovative solutions.',
    summary: 'Salesforce expert driving customer success through innovative solutions.',
    tier: 'D',
    status: { approved: true, reason: 'Strong track record of exceeding sales targets and building lasting client relationships.' },
  },
  {
    name: 'Liam Rios', title: 'Research Scientist', company: 'Google', headline: 'New York City: Where Dreams Meet Reality',
    summary: 'New York City: Where Dreams Meet Reality',
    tier: 'A',
    status: { approved: true, reason: 'Deep expertise in machine learning research with multiple published papers in top conferences.' },
  },
  {
    name: 'Harper Tran', title: 'Backend Developer', company: 'Amazon', headline: 'Mastering Cloud Solutions from Seattle, WA',
    summary: 'Mastering Cloud Solutions from Seattle, WA',
    tier: 'B',
    status: { approved: true, reason: 'Proficient in distributed systems and cloud-native architectures at scale.' },
  },
  {
    name: 'Ava Dubois', title: 'AI Researcher', company: 'OpenAI', headline: 'Innovating Ethical AI from San Francisco, CA',
    summary: 'Innovating Ethical AI from San Francisco, CA',
    tier: 'A',
    status: { approved: true, reason: 'Pioneering work in alignment and safety research with direct industry impact.' },
  },
  {
    name: 'Mateo Rossi', title: 'DevOps Engineer', company: 'Cisco', headline: 'Ensuring seamless deployments and cloud uptime.',
    summary: 'Ensuring seamless deployments and cloud uptime.',
    tier: 'C',
    status: { approved: true, reason: 'Expert in CI/CD, cloud automation, and infrastructure as code. Drives operational excellence.' },
  },
  {
    name: 'Lila Brody', title: 'QA Lead', company: 'Dropbox', headline: 'Quality assurance specialist ensuring flawless releases.',
    summary: 'Quality assurance specialist ensuring flawless releases.',
    tier: 'B',
    status: { approved: true, reason: 'Leader in automated testing and quality metrics. Proven success with agile teams.' },
  },
  {
    name: 'Kevin Zhu', title: 'Mobile Developer', company: 'Spotify', headline: 'Crafting fluid user experiences on mobile platforms.',
    summary: 'Crafting fluid user experiences on mobile platforms.',
    tier: 'D',
    status: { approved: true, reason: 'Specialized in React Native and Kotlin. Adept at cross-platform product releases.' },
  },
  {
    name: 'Olivia Nassar', title: 'Security Analyst', company: 'CrowdStrike', headline: 'Safeguarding enterprises through proactive risk management.',
    summary: 'Safeguarding enterprises through proactive risk management.',
    tier: 'F',
    status: { approved: false, reason: 'Needs stronger demonstration of incident response and vulnerability assessment.' },
  },
  {
    name: 'Hugo Knight', title: 'Full Stack Engineer', company: 'Meta', headline: 'Building scalable and reliable web applications.',
    summary: 'Building scalable and reliable web applications.',
    tier: 'B',
    status: { approved: true, reason: 'Hands-on experience with distributed systems and cloud architectures.' },
  },
  {
    name: 'Sara Fleming', title: 'HR Business Partner', company: 'Twitter', headline: 'Strategic people leader optimizing organizational culture.',
    summary: 'Strategic people leader optimizing organizational culture.',
    tier: 'C',
    status: { approved: true, reason: 'Skilled in data-driven hiring and retention strategies.' },
  },
  {
    name: 'Ben Salem', title: 'AI Product Owner', company: 'DeepMind', headline: 'Bridging research and applications in AI products.',
    summary: 'Bridging research and applications in AI products.',
    tier: 'A',
    status: { approved: true, reason: 'Excellent at managing product lifecycles and translating ML research to market.' },
  },
  {
    name: 'Julia Weiss', title: 'Growth Marketer', company: 'Shopify', headline: 'Driving exponential user growth via digital channels.',
    summary: 'Driving exponential user growth via digital channels.',
    tier: 'D',
    status: { approved: true, reason: 'Built multiple campaigns with proven ROI and acquired millions of users.' },
  },
  {
    name: 'Daniel Owens', title: 'Solutions Consultant', company: 'Oracle', headline: 'Crafting scalable solutions for global clients.',
    summary: 'Crafting scalable solutions for global clients.',
    tier: 'F',
    status: { approved: false, reason: 'Profile lacks recent project impact and quantifiable results.' },
  },
  {
    name: 'Paige Andersen', title: 'Lead Data Engineer', company: 'Databricks', headline: 'Architecting modern big data pipelines.',
    summary: 'Architecting modern big data pipelines.',
    tier: 'A',
    status: { approved: true, reason: 'Expert in Spark, streaming, and scalable data systems with business impact.' },
  },
  {
    name: 'Martin Guyot', title: 'Frontend Lead', company: 'Atlassian', headline: 'User-focused developer bringing designs to life.',
    summary: 'User-focused developer bringing designs to life.',
    tier: 'C',
    status: { approved: true, reason: 'Well-versed in accessibility and design systems.' },
  },
  {
    name: 'Sophia Chang', title: 'Cloud Security Engineer', company: 'AWS', headline: 'Protecting cloud environments at scale.',
    summary: 'Protecting cloud environments at scale.',
    tier: 'B',
    status: { approved: true, reason: 'Specialist in IAM and cloud security architecture.' },
  },
  {
    name: 'Ronald Bishop', title: 'Support Manager', company: 'Zendesk', headline: 'Championing customer success with empathy.',
    summary: 'Championing customer success with empathy.',
    tier: 'F',
    status: { approved: false, reason: 'Needs stronger data to support success claims and outcomes.' },
  },
];

const STATS = [
  { label: 'Approved', value: 43, color: 'bg-green-700' },
  { label: 'Rejected', value: 47, color: 'bg-red-700' },
];

const TIERS = [
  { label: 'A tier', value: 14, color: 'bg-green-700' },
  { label: 'B tier', value: 9, color: 'bg-blue-700' },
  { label: 'C tier', value: 2, color: 'bg-yellow-700' },
  { label: 'D tier', value: 50, color: 'bg-orange-700' },
  { label: 'F tier', value: 75, color: 'bg-red-700' },
];

export function RankedCandidateList() {
  return (
    <div className="">
      <div className="flex items-center justify-end gap-2 px-4 py-2 h-11 shrink-0">
        <span className="text-xs text-muted-foreground">
          Previewing <span className="font-medium text-foreground">100</span> out of{' '}
          <span className="font-medium text-foreground">10,000</span> ranked
        </span>
        <Button size="sm" variant="outline">Run full ranking</Button>
        <Button size="sm" variant="default">Publish</Button>
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-2 border-t border-gray-200 shrink-0 h-10">
        <div className="flex items-center gap-5">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-xs flex items-center gap-2">
              <span className={`${stat.color} inline-block rounded-full size-2`} />
              <span className="font-medium text-muted-foreground">{stat.label}</span>{' '}
              <span className="font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-5">
          {TIERS.map((tier) => (
            <div key={tier.label} className="text-xs flex items-center gap-2">
              <span className={`${tier.color} inline-block rounded-full size-2`} />
              <span className="font-medium text-muted-foreground">{tier.label}</span>{' '}
              <span className="font-semibold">{tier.value}</span>
            </div>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 border-t border-gray-200 h-[calc(100vh-141px)]">
        <ItemGroup className="p-1 gap-1">
          {MOCK_RANKED_CANDIDATES.map((candidate) => (
            <CandidateItem key={candidate.name} {...candidate} />
          ))}
        </ItemGroup>
      </ScrollArea>
    </div>
  );
}
