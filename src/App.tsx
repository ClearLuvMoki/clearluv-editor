import { NotionEditor } from "./core";

const App = () => {
  return (
    <div className="content">
      <NotionEditor onUpdate={console.log} />
    </div>
  );
};

export default App;
