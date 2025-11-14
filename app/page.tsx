import Tittle from "./components/shared/tittle.components";
import LineCardsDemo, { DemoRow } from "./components/LineCardsDemo";

const demoData: DemoRow[] = [
  { id: 1, Name: "John Doe", Age: 30, Occupation: "Engineer", Country: "USA" },
  { id: 2, Name: "Jane Smith", Age: 25, Occupation: "Designer", Country: "USA" },
  { id: 3, Name: "Sam Johnson", Age: 40, Occupation: "Manager", Country: "Canada" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Tittle />
      <LineCardsDemo data={demoData} />
    </div>
  );
}
