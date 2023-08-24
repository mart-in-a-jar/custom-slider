import "./App.scss";
import { Slider } from "./Slider";

const mockCall = (delay) =>
    new Promise((resolve, reject) =>
        setTimeout(() => {
            const random = Math.random();
            if (random > 0.4) {
                resolve("Success");
            }
            if (random > 0.2) {
                resolve("Failure");
            }
            reject("Error");
        }, delay)
    );

const unlockAction = async (id) => {
    const result = await mockCall(1000);
    if (result === "Success") {
        console.log(`Door ${id} has been opened`);
    }
    return result;
};

function App() {
    return (
        <div className="app">
            {[...Array(5)].map((x, i) => {
                return (
                    <Slider
                        text={"Slide to unlock"}
                        header={`Door ${i + 1}`}
                        action={async () => {
                            return await unlockAction(i + 1);
                        }}
                        key={i}
                        clickAway={i === 3}
                        gradient={!(i > 3)}
                    />
                );
            })}
        </div>
    );
}

export default App;
