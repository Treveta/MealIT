function my_number_encrypt($data, $key, $base64_safe=true, $minlen=8) {
    $data = base_convert($data, 10, 36);
    $data = str_pad($data, $minlen, '0', STR_PAD_LEFT);
    $data = mcrypt_encrypt(MCRYPT_BLOWFISH, $key, $data, MCRYPT_MODE_CBC);
    if ($base64_safe) $data = str_replace('=', '', base64_encode($data));
    return $data;
}

function my_number_decrypt($data, $key, $base64_safe=true) {
    if ($base64_safe) $data = base64_decode($data);
    $data = mcrypt_decrypt(MCRYPT_BLOWFISH, $key, $data, MCRYPT_MODE_CBC);
    $data = base_convert($data, 36, 10);
    return $data;
}

$key = "my super secret magic bytes";

$id = 12345678; // obtain_normal_key_from_mysql();

// give ID to user
$enc = my_number_encrypt($i, $key);

// get ID from user
$dec = my_number_decrypt($enc, $key);
// fetch from database using normal ID -> 12345678

// demo code
for($i=10000; $i<10050; $i++) {
    $enc = my_number_encrypt($i, $key);
    $dec = my_number_decrypt($enc, $key);
}