CREATE OR REPLACE VIEW view_detail_akun AS
SELECT 
    akun.email "email", 
    mahasiswa.nama "nama", 
    mahasiswa.nim "nim",
    akun.password "password", 
    role.nama "role" 
FROM 
    akun, 
    role, 
    mahasiswa 
WHERE 
    role.id = akun.id_role AND 
    akun.email = mahasiswa.email;