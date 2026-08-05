let html5QrCode = null;

function startScan() {
    const resultElement = document.getElementById("result-text");
    const inputElement = document.getElementById("code-input");
    const scanBtn = document.getElementById("scan-btn");
    if (html5QrCode && html5QrCode.isScanning) {
        stopScan();
        return;
    }

    html5QrCode = new Html5Qrcode("reader");
    scanBtn.innerText = "🛑 Stop Scan";

    html5QrCode.start(
        { facingMode: "environment" }, 
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
            resultElement.innerText = decodedText; 
            inputElement.value = decodedText;
            stopScan();                            
        },
        (errorMessage) => {
        }
    ).catch((err) => {
        alert("Gagal akses kamera! Pastikan izin kamera di AndroidManifest sudah benar, atau coba restart aplikasinya.");
        scanBtn.innerText = "📷 Scan Barcode";
    });
}

function stopScan() {
    const scanBtn = document.getElementById("scan-btn");
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
            scanBtn.innerText = "📷 Scan Barcode";
        }).catch((err) => {
            console.error("Gagal stop kamera", err);
        });
    }
}


function generateBarcode() {
    const textInput = document.getElementById("code-input").value;
    
    if (textInput.trim() === "") {
        document.getElementById("barcode").innerHTML = "";
        return;
    }

    try {
        JsBarcode("#barcode", textInput, {
            format: "CODE128",
            lineColor: "#000000", 
            width: 1.5,            
            height: 70,
            displayValue: true
        });
    } catch (error) {
        console.error("Gagal membuat barcode:", error);
    }
}

// Variabel global menampung riwayat
let gTerpilih = null;
let hurufTerpilihGlobal = null;

// FUNGSI 1: Buka Modal & Paksa Scroll Kembali ke Posisi Terakhir
function bukaModalLokasi() {
    document.getElementById("modal-lokasi").style.display = "flex";z
    
    if (gTerpilih !== null && hurufTerpilihGlobal !== null) {
        tampilkanNomorRak(hurufTerpilihGlobal);
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const boxScroll = document.getElementById("boks-scroll-rak");
                if (boxScroll && posisiScrollTerakhir > 0) {
                    boxScroll.scrollTop = posisiScrollTerakhir;
                }
            });
        });
    } else if (gTerpilih !== null) {
        tampilkanG(gTerpilih);
    }
}

// FUNGSI 2: Menutup Pop-Up Modal
function tutupModalLokasi() {
    document.getElementById("modal-lokasi").style.display = "none";
}

// FUNGSI 3: Kembali
function kembaliKeHuruf() {
    if (hurufTerpilihGlobal !== null) {
        hurufTerpilihGlobal = null; 
        posisiScrollTerakhir = 0; 
        tampilkanG(gTerpilih);      
    }
}


// FUNGSI 4: Otomatis Menampilkan Tombol Huruf Berpasangan 
function tampilkanG(nomorG) {
    gTerpilih = nomorG;
    const konten = document.getElementById("konten-lokasi");
    
    let htmlHasil = "<strong>Pilih Lorong G" + nomorG + ":</strong><br><br>";
    htmlHasil += '<div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; max-height: 40vh; overflow-y: auto; padding: 10px 5px;">';

    for (let i = 65; i <= 84; i += 2) {
        const h1 = String.fromCharCode(i);
        const h2 = String.fromCharCode(i + 1);
        const gabungHuruf = h1 + "-" + h2; 
        
        htmlHasil += '<button type="button" onclick="tampilkanNomorRak(\'' + gabungHuruf + '\')" style="background: #e67e22; color: white; width: 115px; height: 65px; font-size: 18px; font-weight: bold; border: none; border-radius: 10px; margin: 4px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">' + gabungHuruf + '</button>';
    }

    htmlHasil += "</div>";
    konten.innerHTML = htmlHasil;
}

// FUNGSI 5: Menampilkan List Nomor Rak (LENGKAP DENGAN ID BOKS SCROLL)
function tampilkanNomorRak(gabungHuruf) {
    hurufTerpilihGlobal = gabungHuruf; 
    const konten = document.getElementById("konten-lokasi");
    const config = AturanLokasiGudang[gTerpilih];
    
    const hurufArr = gabungHuruf.split("-");
    const h1 = hurufArr[0];
    const h2 = hurufArr[1];
    
    const prefix1 = "G" + gTerpilih + h1; 
    const prefix2 = "G" + gTerpilih + h2; 

    const tombolTutupAsli = document.querySelector("#modal-lokasi button[onclick='tutupModalLokasi()']");
    if (tombolTutupAsli) tombolTutupAsli.style.display = 'none';

    let htmlHasil = '<strong style="font-size: 15px;">Lorong Jalan ' + prefix1 + ' & ' + prefix2 + '</strong><br><br>';
    
    // LANGKAH 3 ADA DI BARIS INI: Dikasih id="boks-scroll-rak"
    htmlHasil += '<div id="boks-scroll-rak" style="display: flex; gap: 8px; max-height: 42vh; overflow-y: auto; border: 2px solid #cbd5e1; padding: 8px; border-radius: 10px; background: #f8fafc;">';

    // === KOLOM KIRI ===
    htmlHasil += '<div style="flex: 1;">';
    htmlHasil += '<div style="text-align: center; font-weight: bold; background: #34495e; color: white; padding: 6px 2px; border-radius: 5px; margin-bottom: 8px; font-size: 13px;">' + prefix1 + '</div>';
    for (let i = config.start; i <= config.end; i++) {
        const formatAngka = String(i).padStart(3, "0");
        const kodeLokasiUtama = prefix1 + "-" + formatAngka;
        
        if (config.mix.includes(i)) {
            htmlHasil += '<div style="background: #fff9db; padding: 4px; margin-bottom: 8px; border-left: 3px solid #f1c40f; border-radius: 6px;">';
            for (let sub = 1; sub <= 6; sub++) {
                const kodeMixFull = kodeLokasiUtama + "-" + sub;
                htmlHasil += '<div onclick="pilihLokasi(\'' + kodeMixFull + '\')" style="font-family: monospace; font-weight: bold; padding: 10px 0; color: #2c3e50; text-align: center; cursor: pointer; border-bottom: 1px solid #fce8a6; font-size: 13.5px;">' + kodeMixFull + '</div>';
            }
            htmlHasil += '</div>';
        } else {
            htmlHasil += '<div onclick="pilihLokasi(\'' + kodeLokasiUtama + '\')" style="background: #ffffff; padding: 12px 2px; margin-bottom: 8px; border: 2px solid #cbd5e1; border-radius: 8px; font-family: monospace; font-size: 13.5px; font-weight: bold; color: #0f172a; text-align: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">' + kodeLokasiUtama + '</div>';
        }
    }
    htmlHasil += '</div>'; 

    // === KOLOM KANAN ===
    htmlHasil += '<div style="flex: 1;">';
    htmlHasil += '<div style="text-align: center; font-weight: bold; background: #34495e; color: white; padding: 6px 2px; border-radius: 5px; margin-bottom: 8px; font-size: 13px;">' + prefix2 + '</div>';
    for (let i = config.start; i <= config.end; i++) {
        const formatAngka = String(i).padStart(3, "0");
        const kodeLokasiUtama = prefix2 + "-" + formatAngka;
        
        if (config.mix.includes(i)) {
            htmlHasil += '<div style="background: #fff9db; padding: 4px; margin-bottom: 8px; border-left: 3px solid #f1c40f; border-radius: 6px;">';
            for (let sub = 1; sub <= 6; sub++) {
                const kodeMixFull = kodeLokasiUtama + "-" + sub;
                htmlHasil += '<div onclick="pilihLokasi(\'' + kodeMixFull + '\')" style="font-family: monospace; font-weight: bold; padding: 10px 0; color: #2c3e50; text-align: center; cursor: pointer; border-bottom: 1px solid #fce8a6; font-size: 13.5px;">' + kodeMixFull + '</div>';
            }
            htmlHasil += '</div>';
        } else {
            htmlHasil += '<div onclick="pilihLokasi(\'' + kodeLokasiUtama + '\')" style="background: #ffffff; padding: 12px 2px; margin-bottom: 8px; border: 2px solid #cbd5e1; border-radius: 8px; font-family: monospace; font-size: 13.5px; font-weight: bold; color: #0f172a; text-align: center; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">' + kodeLokasiUtama + '</div>';
        }
    }
    htmlHasil += '</div>'; 

    htmlHasil += '</div>'; 

    // Navigasi Bawah
    htmlHasil += '<button type="button" onclick="kembaliKeHuruf()" style="background: #7f8c8d; color: white; padding: 12px; font-size: 15px; font-weight: bold; width: 100%; margin-top: 12px; border: none; border-radius: 8px;">⬅️ Kembali Pilih Lorong</button>';
    htmlHasil += '<div style="text-align: center; margin-top: 8px; margin-bottom: 4px;">';
    htmlHasil += '<button type="button" onclick="tutupModalLokasi()" style="background: #e74c3c; color: white; padding: 10px; font-size: 14px; font-weight: bold; width: 50%; border: none; border-radius: 8px; display: inline-block;">❌ Tutup</button>';
    htmlHasil += '</div>';
    
    konten.innerHTML = htmlHasil;
}


// FUNGSI 6: Catat Scroll Tepat Sebelum Modal Nutup
function pilihLokasi(kodePilihan) {
    const boxScroll = document.getElementById("boks-scroll-rak");
    if (boxScroll) {
        posisiScrollTerakhir = boxScroll.scrollTop;
    }
    document.getElementById("code-input").value = kodePilihan;
    if (typeof generateBarcode === "function") {
        generateBarcode();
    }
    
    tutupModalLokasi(); 
}
