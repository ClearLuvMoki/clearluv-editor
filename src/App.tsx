import { NotionEditor } from "./core";
import DataJSON from "./data/data.json";

const App = () => {
  return (
    <div className="content">
      <NotionEditor
        content={DataJSON}
        contentType={"markdown"}
        onUpdate={({ editor }) => {
          console.log(editor.getJSON());
          // console.log(editor);
        }}
      />
    </div>
  );
};

export default App;
