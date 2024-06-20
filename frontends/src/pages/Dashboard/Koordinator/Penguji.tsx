import { SetStateAction, useEffect, useState } from "react";
import { getAllDataDosen } from "../../../services/AdminProdiService";
import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import SeachField from "../../../components/SeachField";
import { createPengujiKoordinator, deleteDataDosenPengujiKoordinator, editDataDosenPengujiKoordinator, getDataDosenPengujiPage, getSearchDataDosenPenguji } from "../../../services/KoordinatorTAService";
import Swal from "sweetalert2";
import TablePengujiKoordinator from "../../../components/TablePengujiKoordinator";
import Pagination from "../../../components/Pagination";


function Penguji() {
  const [nidn, setNidn] = useState("");
  const [kuota, setKuota] = useState("");

  const [body, Setbody] = useState([]);

  const [bodypage, setBodyPage] = useState([]);

  const [page, setPage] = useState(1);
  const [pageInterval, setPageInterval] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const [refresh, setRefresh] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);

  useEffect(() => {
    getAllDataDosen().then((data) => {
      Setbody(data.results);
    });
  }, []);

  useEffect(() => {
    getDataDosenPengujiPage(page).then((data) => {
      setBodyPage(data.results);
      setTotalItems(data.info.total_all_data);
      setPageInterval(data.info.data_per_page);
      setTotalPage(data.info.total_page);
    });
  }, [page, refresh]);

  const [searchData, setSearchData] = useState("");
  useEffect(() => {
    if (!searchData) {
      setRefresh(!refresh);
    }
    getSearchDataDosenPenguji(searchData).then((data) => {
      setBodyPage(data.results);

      setTotalItems(data.info.total_all_data);
      setPageInterval(data.info.data_per_page);
      // setCurrentPage(data.info.current_page);
      setTotalPage(data.info.total_page);
    });
  }, [searchData]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <div className="h-full">
      <div className="flex gap-5 w-full h-full p-5">
        <div className="w-[37%] ml-2 h-full flex justify-center rounded-xl bg-gray-200 border-t border-b border-black items-center">
          <Card className="p-10 w-full">
            <h1 className="text-xl text-center ml-1 underline mb-6 font-poppins-semibold">
              Dosen Penguji
            </h1>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log(nidn, kuota);
                setLoadingButton(true);
                if (editMode) {
                  editDataDosenPengujiKoordinator(
                    nidn,
                    kuota
                  ).then((data) => {
                    setLoadingButton(false);
                    if (data.response) {
                      Swal.fire({
                        icon: "success",
                        title: "Berhasil",
                        text: data.message,
                        showConfirmButton: false,
                        timer: 3000,
                      }).then(() => {
                        setNidn("");
                        setKuota("");
                        setRefresh(!refresh);
                        setEditMode(false);
                      })
                    }else{
                      Swal.fire({
                        icon: "error",
                        title: "Gagal",
                        text: data.message,
                        showConfirmButton: false,
                        timer: 3000,
                      });
                    }
                  });
                }else{
                  createPengujiKoordinator(nidn, kuota).then((data) => {
                    setLoadingButton(false);
                    if (data.response) {
                      Swal.fire({
                        icon: "success",
                        title: "Berhasil",
                        text: data.message,
                        showConfirmButton: false,
                        timer: 3000,
                      }).then(() => {
                        setNidn("");
                        setKuota("");
                        setLoadingButton(false);
                        setRefresh(!refresh);
                      })
                    }else{
                      Swal.fire({
                        icon: "error",
                        title: "Gagal",
                        text: data.message,
                        showConfirmButton: false,
                        timer: 3000,
                      });
                    }
                  })
                }
              }}
            >
              <p className="text-xl mb-4 font-poppins">
                Nama Dosen: <span className="text-red-500">*</span>
              </p>
              <select
                className="w-full border border-black rounded-md p-2"
                onChange={(e) => setNidn(e.target.value)}
                value={nidn}
              >
                <option value="">-- Pilih Dosen --</option>
                {body?.map((data:{nidn:string, nama:string}) => {
                  return <option value={data.nidn}>{data.nama}</option>;
                })}
              </select>

              <Input
                className=""
                type="text"
                required={true}
                placeholder="127172871288"
                label="NIDN: "
                disabled={true}
                value={nidn}
              ></Input>

              <Input
                className=""
                type="number"
                maxLength={2}
                required={true}
                placeholder="masukkan kuota"
                label="Kuota: "
                value={kuota}
                onchange={(e) => {
                  setKuota(e.target.value);
                }}
              ></Input>
              <div className="flex gap-3">
                <Button
                  text="Batal"
                  onClick={() => {
                    setEditMode(false);
                    setNidn("");
                    setKuota("");
                  }}
                  type="button"
                  className="bg-red-400 cursor-pointer border border-black rounded-md font-bold w-[30%] mt-4 text-xl hover:bg-[#ae2d2d]"
                />
                <Button
                  className={`${
                    editMode
                      ? "bg-yellow-300 hover:bg-yellow-400"
                      : "bg-[#8BD3DD]"
                  } cursor-pointer border border-black rounded-md font-bold w-full mt-4 text-xl hover:bg-[#72abc8] disabled:bg-[#7dabb8]`}
                  text={
                    loadingButton
                      ? "Sedang Memproses..."
                      : editMode
                      ? "Perbarui Data"
                      : "Tambahkan"
                  }
                  type="submit"
                />
              </div>
            </form>
          </Card>
        </div>

        <div className="flex flex-col h-full w-[63%]">
          <div className="flex flex-col mr-2 gap-4 overflow-auto h-full">
            <SeachField onChange={(e) => setSearchData(e as SetStateAction<string>)} />
            <TablePengujiKoordinator body={bodypage} onDelete={(nidn) =>{
              Swal.fire({
                title: "Apakah Anda yakin?",
                text: "Data yang di hapus tidak dapat dikembalikan!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#e09719",
                confirmButtonText: "Hapus",
                cancelButtonText: "Batal",
              }).then((result) => {
                if (result.isConfirmed) {
                  deleteDataDosenPengujiKoordinator(nidn).then((data) => {
                    if (data.response) {
                      Swal.fire({
                        icon: "success",
                        title: "Hapus data dosen berhasil!",
                        text: data.message,
                        showConfirmButton: false,
                        showCloseButton: false,
                        timer: 2000,
                      }).then(() => {
                        setRefresh(!refresh);
                      });
                    } else {
                      Swal.fire({
                        icon: "error",
                        title: "Hapus data dosen gagal!",
                        text: data.message,
                        showConfirmButton: false,
                        showCloseButton: false,
                        timer: 2000,
                      });
                    }
                  });
                }
              });
            }} onEdit={(nidn,kuota_awal) =>{
              setEditMode(true)
              setKuota(kuota_awal)
              setNidn(nidn)
              }}/>
            <Pagination
              totalItems={totalItems}
              totalPages={totalPage}
              itemsPerPage={pageInterval}
              currentPage={page}
              onPageChange={(page) => {
                setPage(page);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Penguji;
