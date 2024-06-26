import { useEffect, useState } from "react";
import topimage from "../../../assets/images/pngs/siptatif-logo.png";
import LupaPassword from "./LupaPassword";
import ResetPassword from "./ResetPassword";
import { useSearchParams } from "react-router-dom";
import { verifyLupaPasswordTokenFromEmailService } from "../../services/LupaPassword";
import Swal from "sweetalert2";
import CustomMarquee from "../../components/Marquee";
import Footer from "../../components/Footer";
import { LoadingFullScreen } from "../../components/Loading";
import { getListPengumuman } from "../../services/PengumumanService";
function LupaPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [email, setEmail] = useState("");

  const [searchParams] = useSearchParams("");
  const tokenVerification = searchParams.get("__token_verification");

  const [list_announcement, setListAnnouncement] = useState<string>("");

  useEffect(() => {
    if (tokenVerification) {
      // method untuk memvalidasi token yang dikirim dan yang di terima dari email
      verifyLupaPasswordTokenFromEmailService(tokenVerification).then(
        (data) => {
          if (data.response) {
            Swal.fire({
              title: "Yeay, verifikasi anda berhasil!",
              html: data.message,
              icon: "success",
              showConfirmButton: false,
              timer: 4000,
            }).then(() => {
              setEmail(data.results.email);
              setReset(true);
            });
          } else {
            Swal.fire({
              title: "Yah, verifikasi anda gagal!",
              html: data.message,
              icon: "error",
              showConfirmButton: false,
              timer: 4000,
            });
          }
        }
      );
    }
  }, [tokenVerification]);

  useEffect(() => {
    let pengumuman = "";
    getListPengumuman().then((data) => {
      for (let i = 0; i < data.results.length; i++) {
        pengumuman = `${pengumuman} ${data.results[i].isi} ${
          i === data.results.length - 1 ? "" : "|"
        }`;
      }
      setListAnnouncement(pengumuman);
    });
  });
  return (
    <>
      {isLoading && <LoadingFullScreen />}
      <div className="flex flex-col bg-[#F2F7F5] h-screen font-poppins">
        {/* marquee pengumuman information */}
        <CustomMarquee list_announcement={list_announcement} />
        {/* main content */}
        <div
          id="main-content"
          className="flex items-center justify-center flex-1 gap-14"
        >
          {/* Logo siptatif usr */}
          <div className="hidden sm:block">
            <img src={topimage} className="w-[530px]" alt="Top Image" />
          </div>
          {/* form login */}
          <div className="w-10/12 sm:w-4/12">
            {reset ? (
              <ResetPassword
                email={email}
                onButtonClicked={({ isBoolLoading }) =>
                  setIsLoading(isBoolLoading)
                }
              />
            ) : (
              <LupaPassword
                onButtonClicked={({ isBoolLoading }) =>
                  setIsLoading(isBoolLoading)
                }
              />
            )}
          </div>{" "}
          {/* end of form login */}
        </div>{" "}
        <Footer />
        {/* end of main content */}
      </div>
    </>
  );
}

export default LupaPasswordPage;
