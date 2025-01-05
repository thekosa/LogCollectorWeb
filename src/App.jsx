import './App.css'
import {useEffect, useState} from "react"
import {collection, getDocs} from "firebase/firestore"
import {db} from "./firebaseConfig"

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
            case "F": //Fatal
                return "row-fatal";
            case "E": // Error
                return "table-danger"; // Czerwony wiersz
            case "W": // Warning
                return "table-warning"; // Żółty wiersz
            case "I": // Info
                return "table-info"; // Niebieski wiersz
            case "D": // Debug
                return "table-success"; // Szary wiersz
            case "V": // Verbose
                return "row-verbose"; // Zielony wiersz
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
                setData(sortedItems);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData().then(r => console.log(r));
    }, []);

    return (
        <div className="container-fluid ">
            <div className="mb-3">
                {COLUMNS.map(({key, label}) => (
                    <button
                        key={key}
                        className="btn btn-lc me-2 button-lc"
                        onClick={() => toggleColumn(key)}
                    >
                        {hiddenColumns[key] ? `Pokaż ${label}` : `Ukryj ${label}`}
                    </button>
                ))}
            </div>

            <div className="container-fluid d-flex justify-content-center align-items-center"
                 style={{minHeight: "100vh"}}>
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
    )
        ;
}

export default App;
