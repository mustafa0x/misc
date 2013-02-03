<?php
/**
  *   @author:      mustafa
  *   @website:     http://mus.tafa.us
  *   @email:       mustafa.0x@gmail.com
  *
  *   Copyright (C) mustafa
  *   This program is free software; you can redistribute it and/or modify
  *   it under the terms of the GNU Lesser General Public License v2.1
  *   as published by the Free Software Foundation.
  *
  *   http://www.gnu.org/licenses/old-licenses/lgpl-2.1.txt
  */

/**
 * http://www.php.net/manual/en/faq.using.php#faq.using.shorthandbytes
 * Returns php.ini shorthand values in bytes
 */
function ini2byt($v){
	$v = trim(ini_get($v));
	switch (strtolower($v[strlen($v)-1])) {
		case 'g': $v *= 1024;
		case 'm': $v *= 1024;
		case 'k': $v *= 1024;
    }
	return $v;
}

/**
 * Retrives the mtime or adds the mtime from/to a gzip file
 * http://www.gzip.org/zlib/rfc-gzip.html#member-format
 */
function gzmtime($gz, $ts = null){
	if ($ts){
		$r = fopen($gz, 'r+');
		fseek($r, 4);
		fwrite($r, pack('V', $ts));
		fclose($r);
		return true;
	}
	return end(unpack('V', file_get_contents($gz, null, null, 4, 4)));
}

/**
 * Check for client's support of gzip
 */
$accept_gz = strpos($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') !== false;

$gz_support = function_exists('gzopen');
$mem_limit = ini2byt('memory_limit');

/**
 * Number of days (in seconds) before content expiration.
 * Default is 90 days.
 */
$expiration = 90 * 86400;

/**
 * HTTP headers
 */
$gz_header = 'Content-Encoding: gzip';
$cl_header = 'Content-Length: ';
$ct_header = 'Content-Type: ';

$lm_header = 'Last-Modified: ';
$cc_header = 'Cache-Control: must-revalidate, max-age=';

$l_header = 'Location: ';
/**
 * This header tells the client that the content-type sent is
 * due to it's accept-encoding request header (gzip, in this case).
 */
$vary_header = 'Vary: Accept-Encoding';

/**
 * "Safe Mode". Only allows predefined files to
 * be accessed. Keeps directory structure hidden.
 * Recommended.
 */
$safe = false;

/**
 * Use with safe mode.
 * Key => Value array of files which can be accessed.
 * Example: 'jquery' => 'scripts/jquery-min.js.gz'
 * Usage: gz.php?s=jquery
 */
$files = array();

/**
 * Allowed extensions with the corresponding mime type
 */
$types = array(
	'js' => 'text/javascript',
	'css' => 'text/css'
);

$s = $_GET['s'];
$s = $safe ? $files[$s] : $s;

if (!$s){
	header('HTTP/1.1 400 Bad Request');
	exit('400 - Bad Request');
}

$is_gz = strtolower(substr($s, strrpos($s, '.') + 1)) == 'gz';
$toggle_gz = $is_gz ? substr($s, 0, strrpos($s, '.')) : $s . '.gz'; //toggle the gz extention
$ext = strtolower(substr($is_gz ? $toggle_gz : $s, strrpos($is_gz ? $toggle_gz : $s, '.') + 1));
$toggle_gz_exists = is_file($toggle_gz);

/**
 * Only allow pre-defined extensions
 */
if (!$types[$ext]){
	header('HTTP/1.1 400 Bad Request');
	exit('400 - Bad Request');
}

if (!is_file($s)){
	if ($toggle_gz && $toggle_gz_exists) {
		$tmp = $s;
		$s = $toggle_gz;
		$toggle_gz = $tmp;
		$is_gz = !$is_gz;
		unset($toggle_gz_exists, $tmp);
	}
	else {
		header('HTTP/1.1 404 Not Found');
		exit('404 - Not Found');
	}
}

/**
 * We make sure the file requested isn't
 * outside of the document root.
 */
if (strpos(realpath($s), realpath($_SERVER['DOCUMENT_ROOT'])) !== 0){
	header('HTTP/1.1 403 Forbidden');
	exit('403 - Forbidden');
}

$s_fsize = filesize($s);
$s_mtime = $is_gz ? gzmtime($s) : filemtime($s);

/**
 * If the mtime header is not set in the gzip file
 * we get the gzip's mtime.
 */
$s_mtime = $s_mtime ? $s_mtime : filemtime($s);

if ($toggle_gz_exists){
	$toggle_gz_mtime = $is_gz ? filemtime($toggle_gz) : gzmtime($toggle_gz);
	if ($s_mtime != $toggle_gz_mtime){
		if ($s_mtime < $toggle_gz_mtime){
			$tmp = $s;
			$s = $toggle_gz;
			$toggle_gz = $tmp;
			$s_mtime = $toggle_gz_mtime;
			$is_gz = !$is_gz;
		}
		unset($toggle_gz_exists, $tmp);
	}
}

/**
 * If the client's cached version is current
 * reply with 304 Not Modified.
 *
 * We use strtotime since Safari & IE seem to
 * replace +0000 with 'GMT'.
 */
if ($_SERVER['HTTP_IF_MODIFIED_SINCE'] && strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) <= $s_mtime){
	header('HTTP/1.1 304 Not Modified');
	exit;
}
if ($accept_gz){
	if ($is_gz)
		$f = $s;
	else {
		if ($toggle_gz_exists);
		elseif ($gz_support){
			if (function_exists('file_put_contents') && $s_fsize < $mem_limit)
				file_put_contents($toggle_gz, gzencode(file_get_contents($s)));
			else {
				$amt = $s_fsize > $mem_limit ? $mem_limit / 3 : $s_fsize;

				($r = fopen($s, 'rb')) || exit(error_get_last());
				$w = gzopen($toggle_gz, 'wb');

				while (!feof($r))
					gzwrite($w, fread($r, $amt));

				gzclose($w);
				fclose($r);
			}
			gzmtime($toggle_gz, $s_mtime);
		}
		else {
			header($cl_header . filesize($s));
			header($ct_header . $types[$ext]);
			header($lm_header . gmdate('r', $s_mtime));
			header($cc_header . $expiration);
			readfile($s);
			exit;
		}
		$f = $toggle_gz;
	}
	/**
	 * We make this check so that if an error
	 * has occured we stop.
	 */
	headers_sent() && exit;

	header($gz_header);
	header($vary_header);
	header($cl_header . ($f == $s ? $s_fsize : filesize($f)));
	header($ct_header . $types[$ext]);
	header($lm_header . gmdate('r', $s_mtime));
	header($cc_header . $expiration);
	readfile($f);
	exit;
}
else {
	if ($is_gz){
		if ($toggle_gz_exists);
		/**
		 * We don't check for file_put_contents here
		 * becuase there is no gzdecode function in < PHP 6.0 :-(
		 */
		elseif ($gz_support){
			$amt = filesize($s) > $mem_limit ? $mem_limit / 3 : 8192;

			($r = gzopen($s, 'rb')) || exit(error_get_last());
			$w = fopen($toggle_gz, 'wb');

			while (!gzeof($r))
				fwrite($w, gzread($r, $amt));

			fclose($w);
			gzclose($r);
			touch($toggle_gz, $s_mtime);
		}
		else {
			/**
			 * The resource identified by the request is only capable of
			 * generating response entities which have content characteristics
			 * not acceptable according to the accept headers sent in the request.
			 *
			 * http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.4.7
			 */
			header('HTTP/1.1 406 Not Acceptable');
			exit('406 - Not Acceptable');
		}
		$f = $toggle_gz;
	}
	else
		$f = $s;
	header($cl_header . ($f == $s ? $s_fsize : filesize($f)));
	header($ct_header . $types[$ext]);
	header($lm_header . gmdate('r', $s_mtime));
	header($cc_header . $expiration);
	readfile($f);
	exit;
}
?>
