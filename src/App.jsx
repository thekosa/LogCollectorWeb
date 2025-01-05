import './App.css';
import {useEffect, useState} from "react";
import {collection, getDocs} from "firebase/firestore";
import {db} from "./firebaseConfig";
import {Bar} from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';

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
    const [data, setData] = useState([]);
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
                const querySnapshot = await getDocs(collection(db, "samsung SM-G781B"));
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
    }, []);

    // Dane do wykresu
    const chartData = {
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

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // Ukryj legendę
            },
            title: {
                display: true, // Wyświetl tytuł
                text: 'Liczba logów według poziomu priorytetu', // Treść tytułu
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
    };

    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center bg-lc-dark"
             style={{minHeight: "100vh"}}>

            <div style={{
                width: "80%",
                height: "50vh",
                marginTop: "30px",
                marginBottom: "20px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Bar data={chartData} options={chartOptions}/>
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
                    {data.map((item) => (
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
    );
}

export default App;
