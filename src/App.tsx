import './App.css'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEffect, useState } from 'react';
import axios from 'axios';          
import "primereact/resources/themes/lara-light-cyan/theme.css";

import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { useRef } from 'react';


type ArtworkData = {
  id: number,
  title: string,
  place_of_origin: string,
  artist_display: string,
  inscriptions: string,
  date_start: number,
  date_end: number
}

function App() {
  const ROWS_PER_PAGE = 12;
  const [MAX_VISIBLE,setMAX_VISIBLE]= useState([1, 2, 3, 4, 5]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<ArtworkData[]>([]);
  const [customSelection,setcustomSelection] = useState<number|null>(null);
  const [input,setinput] = useState("")
  const [selectedrow,setselectedrow] = useState<Record<number,boolean>>({})
  const overlayRef = useRef<OverlayPanel>(null);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${currentPage}`);
        
        if (res.data) {
          const resData = res.data.data;
          const artworks: ArtworkData[] = resData.map((item: any) => ({
            id: item.id,
            title: item.title,
            place_of_origin: item.place_of_origin,
            artist_display: item.artist_display,
            inscriptions: item.inscriptions,
            date_start: item.date_start,
            date_end: item.date_end,
          }));
          setData(artworks);
        }
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };
    fetchData();
  }, [currentPage]);

  function getselection():ArtworkData[]{
    return data.filter((val,i)=>filterfunction(val.id,i)) 
  }

  function handleSelectionChange (e:any){
    const data = e.value;
    const dataID = data.map((val:ArtworkData)=>val.id);
    setcustomSelection(null);
    setselectedrow({});
    const newrecord :Record<number,boolean> = {}
    dataID.forEach((e:number)=>{
      newrecord[e] = true;
    })
    console.log(newrecord);
    setselectedrow(newrecord);

  }
  function filterfunction(id:number,rowno:number):boolean{
    if(customSelection !== null){
      const globalindex =  (currentPage -1 )* ROWS_PER_PAGE + rowno;
      console.log(globalindex)
      console.log(globalindex < customSelection);
      const isSelect = globalindex < customSelection
      if( !isSelect && selectedrow[id] ){
        return true;
      }

      return isSelect
    } 
    return selectedrow[id];
  }

  function customselection(){
    const count = Number(input)
    console.log(input)
        if (isNaN(count) || count <= 0) {
      alert("Please enter a valid number");
      return;
    }
    setcustomSelection(count);
    setselectedrow({});
    setinput("")
  }

  function next(){
    const set :number[] =[];
    MAX_VISIBLE.forEach((e)=> set.push(e+1))
    setMAX_VISIBLE(set);
  }

  function previous(){
    const set :number[] =[];
    MAX_VISIBLE.forEach((e)=> set.push(e-1))
    setMAX_VISIBLE(set);
  }

    const selectionHeader = (
      <div className="flex items-center gap-2">
        <button
          className="p-button-text p-button-sm"
          onClick={(e) => overlayRef.current?.toggle(e)}
        >Filter</button>
      </div>
    );


  return (
    <div className='w-[90%] mx-auto p-4'>

        <OverlayPanel ref={overlayRef}>
          <div className='flex flex-col gap-2'>
          <div>
            Enter the no of rows to select
          </div>
          <div className="flex gap-2 w-[260px]">
          <input 
          className='w-[150px] border px-2 py-1 rounded h-fit' 
          placeholder='Number of rows' 
          type="number" 
          onChange={(e) => setinput(e.target.value)}/>
        <button 
        onClick={(e)=>{
          overlayRef.current?.toggle(e);
          customselection()}}
        className='px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 h-fit text-md w-fit'
        >
          Select 
        </button>
          </div>
          </div>
        </OverlayPanel>

      {Object.keys(selectedrow).length > 0 && <div className='text-gray-500 text-md'>Selected : { Object.keys(selectedrow).length}</div>}
      <div className='mb-4 flex gap-2'>

      </div>

      <DataTable 
        selection={getselection()}
        onSelectionChange={handleSelectionChange}
        value={data}
        header={selectionHeader}
        tableStyle={{ minWidth: '50rem' }}
        dataKey="id"
        selectionMode="multiple"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="title" header="TITLE"></Column>
        <Column field="place_of_origin" header="PLACE OF ORIGIN"></Column>
        <Column field="artist_display" header="ARTIST"></Column>
        <Column field="inscriptions" header="INSCRIPTION"></Column>
        <Column field="date_start" header="START DATE"></Column>
        <Column field="date_end" header="END DATE"></Column>
      </DataTable>
      
      <div className='flex gap-2 mt-4'>
        <button 
        onClick={previous}
        disabled={currentPage === 1}
        className='px-3 py-1 rounded border bg-white text-gray-500'>previous</button>
        {MAX_VISIBLE.map((pageNum: number) => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            className={`px-3 py-1 rounded border ${
              currentPage === pageNum 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-500 hover:bg-gray-100"
            }`}
          >
            {pageNum}
          </button>
        ))}
                <button className='px-3 py-1 rounded border bg-white text-gray-500'
                onClick={next}
                >next</button>
      </div>
    </div>
  )
}

export default App