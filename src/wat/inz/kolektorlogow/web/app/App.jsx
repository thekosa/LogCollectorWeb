import '.././styles/App.css';
import {useEffect, useState} from "react";
import {collection, deleteDoc, doc, getDocs} from "firebase/firestore";
import {db} from "../db/firebaseConfig.js";
import {Bar} from 'react-chartjs-2';
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip} from 'chart.js';

// Rejestracja komponentów Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const COLUMNS = [
    {key: "dateTime", label: "Data i godzina"},
    {key: "pid", label: "PID"},
    {key: "tid", label: "TID"},
    {key: "priority", label: "Priority"},
    {key: "tag", label: "Tag"},
    {key: "message", label: "Message"},
];

function App() {
    const [toggleSettings, setToggleSettings] = useState(false);
    const [actualDevice, setActualDevice] = useState("");
    const [data, setData] = useState([]);
    const [devices, setDevices] = useState([]);
    const [priorityCounts, setPriorityCounts] = useState({});
    const [hiddenColumns, setHiddenColumns] = useState({
        dateTime: false,
        pid: false,
        tid: false,
        priority: false,
        tag: false,
        message: false,
    });

    const toggleColumn = (column) => {
        setHiddenColumns((prevState) => ({
            ...prevState,
            [column]: !prevState[column],
        }));
    };

    const getRowClass = (priority) => {
        switch (priority) {
            case "F": // Fatal
                return "row-fatal";
            case "E": // Error
                return "table-danger"; // Czerwony wiersz
            case "W": // Warning
                return "table-warning"; // Żółty wiersz
            case "I": // Info
                return "table-info"; // Niebieski wiersz
            case "D": // Debug
                return "table-success"; // Zielony wiersz
            case "V": // Verbose
                return "row-verbose"; // Szary wiersz
            default:
                return ""; // Domyślny kolor
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, actualDevice));
                const items = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                const sortedItems = items.sort((a, b) => a.ordinalNumber - b.ordinalNumber);

                // Zliczanie logów według poziomu priorytetu
                const counts = sortedItems.reduce((acc, item) => {
                    acc[item.priority] = (acc[item.priority] || 0) + 1;
                    return acc;
                }, {});

                setData(sortedItems);
                setPriorityCounts(counts);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData().then(r => console.log(r));
    }, [actualDevice]);


    useEffect(() => {
        const fetchDeviceNames = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "devices-registry"));
                const devicesNames = querySnapshot.docs.map((doc) => doc.data().name); // Zbieranie nazw urządzeń (pola 'name')
                setDevices(devicesNames)
            } catch (error) {
                console.error("Error fetching device names:", error);
            }
        };
        fetchDeviceNames().then(r => console.log(r));
    }, []);

    // Dane do wykresu
    const priorityChartData = {
        labels: ["Fatal", "Error", "Warning", "Info", "Debug", "Verbose"],
        datasets: [
            {
                label: 'Liczba logów',
                data: ["F", "E", "W", "I", "D", "V"].map((key) => priorityCounts[key] || 0),
                backgroundColor: [
                    'rgba(220,53,206,0.81)', // Fatal
                    'rgba(255,99,71,0.83)', // Error
                    'rgba(255,193,7,0.82)', // Warning
                    'rgba(23,162,184,0.8)', // Info
                    'rgba(40,167,69,0.81)', // Debug
                    'rgba(108,117,125,0.8)'  // Verbose
                ],
                borderColor: [
                    'rgb(99,24,93)', // Fatal
                    'rgb(119,47,34)', // Error
                    'rgb(151,114,4)', // Warning
                    'rgb(13,95,108)', // Info
                    'rgb(23,94,39)', // Debug
                    'rgb(60,65,69)'  // Verbose
                ],
                borderWidth: 1,
            }
        ],
    };

    const chartOptions = (title) => ({
        responsive: true,
        plugins: {
            legend: {
                display: false, // Ukryj legendę
            },
            title: {
                display: true, // Wyświetl tytuł
                text: title, // Treść tytułu
                font: {
                    size: 18, // Rozmiar czcionki
                    family: 'Arial, sans-serif', // Czcionka
                    weight: 'bold' // Waga czcionki
                },
                color: '#fff', // Kolor tekstu tytułu
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#ddd', // Kolor tekstu osi X
                },
                grid: {
                    color: '#444', // Kolor grida osi X
                },
            },
            y: {
                ticks: {
                    color: '#ddd', // Kolor tekstu osi Y
                },
                grid: {
                    color: '#444', // Kolor grida osi Y
                },
            }
        },
    });

    const tagCounts = data.reduce((acc, item) => {
        acc[item.tag] = (acc[item.tag] || 0) + 1;
        return acc;
    }, {});

    const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // TOP 10

    const top10ChartData = {
        labels: sortedTags.map(([tag]) => tag),
        datasets: [
            {
                label: "Ilość wystąpień",
                data: sortedTags.map(([, count]) => count),
                backgroundColor: "#007bff",
            },
        ],
    };


    async function deleteDevice(actualDevice) {
        try {
            const devicesCollection = collection(db, "devices-registry");
            const querySnapshot = await getDocs(devicesCollection);
            const deviceToDelete = querySnapshot.docs.find((doc) => doc.data().name === actualDevice);

            if (deviceToDelete) {
                await deleteDoc(doc(db, "devices-registry", deviceToDelete.id));
                console.log(`Urządzenie ${actualDevice} zostało usunięte.`);
                setActualDevice(''); // Resetuje aktualnie wybrane urządzenie
                setDevices((prevDevices) => prevDevices.filter((device) => device !== actualDevice)); // Aktualizuje listę urządzeń
            } else {
                console.warn(`Nie znaleziono urządzenia o nazwie ${actualDevice}.`);
            }
        } catch (error) {
            console.error("Wystąpił błąd przy usuwaniu urządzenia:", error);
        }
    }

    return (

        <div className="container-fluid d-flex flex-column justify-content-center align-items-center bg-lc-dark"
             style={{minHeight: "100vh"}}>

            {(data.length === 0 || actualDevice === "") && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgb(43,45,48)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    fontSize: "24px",
                    fontWeight: "bold",
                    zIndex: 999,
                }}>
                    {actualDevice === ""
                        ? (<div style={{fontSize: "50px"}}>Wybierz urządzenie</div>)
                        : (<div style={{fontSize: "50px"}}>Brak logów</div>)}
                </div>
            )}

            <div className="text-center my-3 align-">
                <div style={{position: "absolute", top: "10px", left: "10px", zIndex: 1000}}>
                    <select
                        className="form-select"
                        onChange={(e) => setActualDevice(e.target.value)}
                        value={actualDevice}
                    >
                        <option value="" disabled>Wybierz urządzenie</option>
                        {devices.map((device, index) => (
                            <option key={index} value={device}>
                                {device}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{position: "absolute", top: "10px", right: "10px", zIndex: 1000}}>
                <div style={{display: "flex", flexDirection: "column", alignItems: "flex-end"}}>
                    <button
                        className="btn btn-secondary"
                        type="button"
                        id="optionsMenuButton"
                        onClick={() => setToggleSettings(!toggleSettings)}
                    >
                        <img src="src/assets/gear.svg" width="30" height="30" alt="options" className="white-svg"/>
                    </button>
                    <button
                        style={{
                            opacity: toggleSettings ? 1 : 0,
                            transform: toggleSettings ? "translateY(0)" : "translateY(-10px)",
                            transition: "opacity 0.3s ease, transform 0.3s ease", // Animacja przejścia
                            marginTop: "10px"
                        }}
                        className="btn btn-danger"
                        onClick={() => deleteDevice(actualDevice)}
                    >
                        Usuń to urządzenie
                    </button>
                </div>
            </div>

            <div className="text-light">Wybrane urządzenie: {actualDevice}</div>

            <div style={{
                width: "80%",
                height: "40vh",
                marginTop: "30px",
                marginBottom: "20px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                {data.length > 30000 ? (
                    <Bar data={top10ChartData} options={chartOptions("10 najczęściej występujących tagów")}/>
                ) : (
                    <div/>
                )}
                <Bar data={priorityChartData} options={chartOptions("Liczba logów według poziomu priorytetu")}/>


            </div>

            <div className="mb-3 text-center" style={{margin: 20}}>
                {COLUMNS.map(({key, label}) => (
                    <button
                        key={key}
                        className={hiddenColumns[key] ? "btn m-2 btn-outline-secondary" : "btn m-2 btn-secondary"}
                        onClick={() => toggleColumn(key)}
                    >
                        {hiddenColumns[key] ? `Pokaż ${label}` : `Ukryj ${label}`}
                    </button>
                ))}
            </div>

            <div className="container-fluid d-flex justify-content-center align-items-center"
                 style={{minHeight: "100vh", width: "80%"}}>
                <div className="table-container">
                    <table className="table table-striped table-bordered table-hover w-100">
                        <thead className="thead-dark">
                        <tr>
                            <th className="d-none">Liczba porządkowa</th>
                            {!hiddenColumns.dateTime && <th>Data i godzina</th>}
                            {!hiddenColumns.pid && <th>PID</th>}
                            {!hiddenColumns.tid && <th>TID</th>}
                            {!hiddenColumns.priority && <th>Priority</th>}
                            {!hiddenColumns.tag && <th>Tag</th>}
                            {!hiddenColumns.message && <th>Message</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {data.slice(-2000).map((item) => (
                            <tr key={item.id} className={getRowClass(item.priority)}>
                                <td className="d-none">{item.ordinalNumber}</td>
                                {!hiddenColumns.dateTime &&
                                    <td>{new Date(item.dateTime.seconds * 1000).toLocaleString()}</td>}
                                {!hiddenColumns.pid && <td>{item.pid}</td>}
                                {!hiddenColumns.tid && <td>{item.tid}</td>}
                                {!hiddenColumns.priority && <td>{item.priority}</td>}
                                {!hiddenColumns.tag && <td>{item.tag}</td>}
                                {!hiddenColumns.message && <td className="text-start">{item.message}</td>}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default App;
