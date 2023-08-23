import "./App.scss";
import { Slider } from "./Slider";

const unlockAction = () => {
    console.log("Door has been unlocked");
};

function App() {
    return (
        <div className="app">
            <Slider text={"Slide to unlock"} action={unlockAction} />
        </div>
    );
}

export default App;
