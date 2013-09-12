<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://labs.funspot.tv/worktest_color_memory/colours.conf");
curl_exec ($ch);
curl_close ($ch);
?>
<!-- CURL: ";extension=php_curl.dll" - remove ';' to activate CURL in php.ini -->