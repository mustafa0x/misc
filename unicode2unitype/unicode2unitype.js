/**
 * TODO:
 *  lower and higher harakat
 *  rtl
 */

function $(element){
	return document.getElementById(element);
}

function unicode2unitype(input){

	/**
	 * Dont bother looking it up if
	 * it isn't an Arabic character
	 */
	function isArChar(cc){
		return (
			(cc > 0x5FF && cc < 0x700) || //Arabic
			(cc > 0x74F && cc < 0x780) || //Arabic Supplement
			(cc > 0xFB4F && cc < 0xFDFE) || //Arabic Presentation Forms-A
			(cc > 0xFE6F && cc < 0xFF00) //Arabic Presentation Forms-B
		);
	}
	/**
	 * We don't want harakat when checking prev & next
	 */
	function seek(pos){
		var t = isArChar(input.charCodeAt(i + pos)) && arabic[input.charAt(i + pos)];
		if (t && (pos > 0 ? cur[0] : cur[2])){
			while (input.charAt(i + (pos > 0 ? pos++ : pos--)) in harakat){
				t = arabic[input.charAt(i + pos)];
			}
			return t;
		}
	}
	var i = input.length, out = "", stripped = 0, ccFn = String.fromCharCode, c, cur, prev, next, use, t;

	for (; i >= 0; i--){
		c = input.charAt(i);
		cur = isArChar(input.charCodeAt(i)) && arabic[c];
		if (!cur){
			/**
			 * strip all unicode.
			 */
			if (input.charCodeAt(i) > 0xFF)
				stripped++;
			else
				out += c;
			continue;
		}
		if (c in harakat){
			t = i;
			do {
				prev = input.charAt(--t);
			} while (prev in harakat);
			if (cur[0])
				use = high[prev] ? 0 : 1;
			if (cur[2])
				use = low[prev] ? 2 : 3;

			out += ccFn(cur[use]);
			use = null;
			continue;
		}

		prev = seek(-1);
		next = seek(1);

		if (prev && prev[0])
			use = 2;
		if (next && next[2])
			use = use ? 1 : 0;
		//alert([c, use]);
		if (low[c] && (use == 0 || use == 1)){
			t = arabic[input.charAt(i + 1)];
			if (t && t[3] && (input.charAt(i + 1) in harakat)){
				out = out.substr(0, out.length - 1) + ccFn(t[3]);
				//alert(c);
			}
		} //this approach isn't too clean

		out += ccFn(cur[use != null ? use : 3]); //since 0 != null
		use = null;
	}
	stripped && alert("Number of Unicode characters stripped: " + stripped);
	
	/**
	 * hack to combine the shadda with harakat
	 */
	var combineShadda = /[\xE9][\xE7\xE8\xEB\xE4\xE5\xEA]|[\xE7\xE8\xEB\xE4\xE5\xEA][\xE9]/g;
	if (combineShadda.test(out)){
		out = out.replace(combineShadda, function(c){
			c = c.charCodeAt(0) == 0xE9 ? c.charAt(1) : c.charAt(0);

			switch (c.charCodeAt(0)){
				case 0xE7: return ccFn(0xEE);
				case 0xE8: return ccFn(0xED);
				case 0xEB: return ccFn(0xFF); //todo
				case 0xE4: return ccFn(0xEC);
				case 0xE5: return ccFn(0xED);
				case 0xEA: return ccFn(0xF0);
			}
		});
	}
	var combineShadda = /[\xF7][\xF5\xF6\xF9\xF2\xF3\xF8]|[\xF5\xF6\xF9\xF2\xF3\xF8][\xF7]/g;
	if (combineShadda.test(out)){
		out = out.replace(combineShadda, function(c){
			c = c.charCodeAt(0) == 0xF7 ? c.charAt(1) : c.charAt(0);

			switch (c.charCodeAt(0)){
				case 0xF5: return ccFn(0xFC);
				case 0xF6: return ccFn(0xFD);
				case 0xF9: return ccFn(0xFF);
				case 0xF2: return ccFn(0xFA);
				case 0xF3: return ccFn(0xFB);
				case 0xF8: return ccFn(0xFE);
			}
		});
	}
	/**
	 * hack to replace the word god with the one character god
	 */
	var godChar = /\u0644\u0644\u0647/g;
	if (godChar.test(out))
		out = out.replace(godChar, ccFn(0x22));
	return out;
}
function wrap(s, o){
}
var harakat = {
	"\u064B" : true, //ً
	"\u064C" : true, //ٌ
	"\u064D" : true, //ٍ
	"\u064E" : true, //َ
	"\u064F" : true, //ُ
	"\u0650" : true, //ِ
	"\u0651" : true, //ّ
	"\u0652" : true, //ْ
	"\u0670" : true  //ٰ
};
var high = {
	"\u0622" : true, //آ
	"\u0623" : true, //أ
	"\u0625" : true, //إ
	"\u0627" : true, //ا

	"\u0637" : true, //ط
	"\u0638" : true, //ظ
	
	"\u0643" : true, //ك
	"\u0644" : true  //ل
};
var low = {
	"\u062C" : true, //ج
	"\u062D" : true, //ح
	"\u062E" : true, //خ

	"\u0633" : true, //س
	"\u0634" : true, //ش
	"\u0635" : true, //ص
	"\u0636" : true, //ض

	"\u0639" : true, //ع
	"\u063A" : true, //غ

	"\u0645" : true, //م

	"\u0649" : true, //ى
	"\u064A" : true  //ي
};
/**
 * Character Format:
 *
 * unicode-codepoint : [
 *    beginning,
 *    middle,
 *    end,
 *    alone
 * ]
 *
 * Harakah Format:
 *
 * unicode-codepoint : [
 *    high-over,
 *    over,
 *    under,
 *    low-under
 * ]
 */
var arabic = {
	/*"\u0600" : [ //؀

	],
	"\u0601" : [ //؁

	],
	"\u0602" : [ //؂

	],
	"\u0603" : [ //؃

	],
	"\u0606" : [ //؆

	],
	"\u0607" : [ //؇

	],
	"\u0608" : [ //؈

	],
	"\u0609" : [ //؉

	],
	"\u060A" : [ //؊

	],
	"\u060B" : [ //؋

	],*/
	"\u060C" : [ //،
		false,
		false,
		false,
		0x2C
	],
	/*"\u060D" : [ //؍

	],
	"\u060E" : [ //؎

	],
	"\u060F" : [ //؏

	],
	"\u0610" : [ //ؐ

	],
	"\u0611" : [ //ؑ

	],
	"\u0612" : [ //ؒ

	],
	"\u0613" : [ //ؓ

	],
	"\u0614" : [ //ؔ

	],
	"\u0615" : [ //ؕ

	],
	"\u0616" : [ //ؖ

	],
	"\u0617" : [ //ؗ

	],
	"\u0618" : [ //ؘ

	],
	"\u0619" : [ //ؙ

	],
	"\u061A" : [ //ؚ

	],*/
	"\u061B" : [ //؛
		false,
		false,
		false,
		0x3B
	],
	/*"\u061E" : [ //؞

	],*/
	"\u061F" : [ //؟
		false,
		false,
		false,
		0x3F
	],
	"\u0621" : [ //ء
		false,
		false,
		false,
		0xD5
	],
	"\u0622" : [ //آ
		false,
		false,
		0x46,
		0x45
	],
	"\u0623" : [ //أ
		false,
		false,
		0x44,
		0x43
	],
	"\u0624" : [ //ؤ
		false,
		false,
		0xDB,
		0xDA
	],
	"\u0625" : [ //إ
		false,
		false,
		0x48,
		0x47
	],
	"\u0626" : [ //ئ
		0xD6,
		0xD7,
		0xD8,
		0xD9
	],
	"\u0627" : [ //ا
		false,
		false,
		0x42,
		0x41
	],
	"\u0628" : [ //ب
		0x49,
		0x4A,
		0x4B,
		0x4C
	],
	"\u0629" : [ //ة
		false,
		false,
		0xD2,
		0xD1
	],
	"\u062A" : [ //ت
		0x4D,
		0x4E,
		0x4F,
		0x50
	],
	"\u062B" : [ //ث
		0x51,
		0x52,
		0x53,
		0x54
	],
	"\u062C" : [ //ج
		0x55,
		0x56,
		0x57,
		0x58
	],
	"\u062D" : [ //ح
		0x59,
		0x5A,
		0x5C,
		0x60
	],
	"\u062E" : [ //خ
		0x61,
		0x62,
		0x63,
		0x64
	],
	"\u062F" : [ //د
		false,
		false,
		0x66,
		0x65
	],
	"\u0630" : [ //ذ
		false,
		false,
		0x68,
		0x67
	],
	"\u0631" : [ //ر
		false,
		false,
		0x6A,
		0x69
	],
	"\u0632" : [ //ز
		false,
		false,
		0x6C,
		0x6B
	],
	"\u0633" : [ //س
		0x6D,
		0x6E,
		0x6F,
		0x70
	],
	"\u0634" : [ //ش
		0x71,
		0x72,
		0x73,
		0x74
	],
	"\u0635" : [ //ص
		0x75,
		0x76,
		0x77,
		0x78
	],
	"\u0636" : [ //ض
		0x79,
		0x7A,
		0x7C,
		0x7E
	],
	"\u0637" : [ //ط
		0x7F,
		0xF1,
		0xA1,
		0xA2
	],
	"\u0638" : [ //ظ
		0xA3,
		0xA4,
		0xA5,
		0xA6
	],
	"\u0639" : [ //ع
		0xA7,
		0xA8,
		0xA9,
		0xAA
	],
	"\u063A" : [ //غ
		0xAB,
		0xAC,
		0xAD,
		0xAE
	],/*
	"\u063B" : [ //ػ

	],
	"\u063C" : [ //ؼ

	],
	"\u063D" : [ //ؽ

	],
	"\u063E" : [ //ؾ

	],
	"\u063F" : [ //ؿ

	],*/
	"\u0640" : [ //ـ
		0x40,
		0x40,
		0x40,
		0x40
	],
	"\u0641" : [ //ف
		0xAF,
		0xB0,
		0xB1,
		0xB2
	],
	"\u0642" : [ //ق
		0xB3,
		0xB4,
		0xB5,
		0xB6
	],
	"\u0643" : [ //ك
		0xB7,
		0xB8,
		0xB9,
		0xBA
	],
	"\u0644" : [ //ل
		0xBB,
		0xBC,
		0xBD,
		0xBE
	],
	"\u0645" : [ //م
		0xBF,
		0xC0,
		0xC1,
		0xC2
	],
	"\u0646" : [ //ن
		0xC3,
		0xC4,
		0xC5,
		0xC6
	],
	"\u0647" : [ //ه
		0xC7,
		0xC8,
		0xC9,
		0xCA
	],
	"\u0648" : [ //و
		false,
		false,
		0xCC,
		0xCB
	],
	"\u0649" : [ //ى
		false,
		false,
		0xD3,
		0xD4
	],
	"\u064A" : [ //ي
		0xCD,
		0xCE,
		0xCF,
		0xD0
	],
	"\u064B" : [ //ً
		0xF5,
		0xE7,
		false,
		false
	],
	"\u064C" : [ //ٌ
		0xF6,
		0xE8,
		false,
		false
	],
	"\u064D" : [ //ٍ
		false,
		false,
		0xF9,
		0xEB
	],
	"\u064E" : [ //َ
		0xF2,
		0xE4,
		false,
		false
	],
	"\u064F" : [ //ُ
		0xF3,
		0xE5,
		false,
		false
	],
	"\u0650" : [ //ِ
		false,
		false,
		0xF8,
		0xEA
	],
	"\u0651" : [ //ّ
		0xF7,
		0xE9,
		false,
		false
	],
	"\u0652" : [ //ْ
		0xF4,
		0xE6,
		false,
		false
	],
	/*"\u0653" : [ //ٓ
	],
	"\u0654" : [ //ٔ

	],
	"\u0655" : [ //ٕ

	],
	"\u0656" : [ //ٖ

	],
	"\u0657" : [ //ٗ

	],
	"\u0658" : [ //٘

	],
	"\u0659" : [ //ٙ

	],
	"\u065A" : [ //ٚ

	],
	"\u065B" : [ //ٛ

	],
	"\u065C" : [ //ٜ

	],
	"\u065D" : [ //ٝ

	],
	"\u065E" : [ //ٞ

	],*/
	"\u0660" : [ //٠
		false,
		false,
		false,
		0x30
	],
	"\u0661" : [ //١
		false,
		false,
		false,
		0x31
	],
	"\u0662" : [ //٢
		false,
		false,
		false,
		0x32
	],
	"\u0663" : [ //٣
		false,
		false,
		false,
		0x33
	],
	"\u0664" : [ //٤
		false,
		false,
		false,
		0x34
	],
	"\u0665" : [ //٥
		false,
		false,
		false,
		0x35
	],
	"\u0666" : [ //٦
		false,
		false,
		false,
		0x36
	],
	"\u0667" : [ //٧
		false,
		false,
		false,
		0x37
	],
	"\u0668" : [ //٨
		false,
		false,
		false,
		0x38
	],
	"\u0669" : [ //٩
		false,
		false,
		false,
		0x39
	],
	"\u066A" : [ //٪
		false,
		false,
		false,
		0x25
	],
	"\u066B" : [ //٫

	],
	"\u066C" : [ //٬

	],
	"\u066D" : [ //٭
		false,
		false,
		false,
		0x2A
	],
	/*"\u066E" : [ //ٮ

	],
	"\u066F" : [ //ٯ

	],*/
	"\u0670" : [ //ٰ
		0x7D,
		0x7B,
		false,
		false
	],
	"\u0671" : [ //ٱ
		false,
		false,
		0xA0,
		0x5F
	],
	/*"\u0672" : [ //ٲ
	],
	"\u0673" : [ //ٳ
	],
	"\u0674" : [ //ٴ
	],
	"\u0675" : [ //ٵ
	],
	"\u0676" : [ //ٶ
	],
	"\u0677" : [ //ٷ
	],
	"\u0678" : [ //ٸ
	],
	"\u0679" : [ //ٹ
	],
	"\u067A" : [ //ٺ
	],
	"\u067B" : [ //ٻ
	],
	"\u067C" : [ //ټ
	],
	"\u067D" : [ //ٽ
	],
	"\u067E" : [ //پ
	],
	"\u067F" : [ //ٿ
	],
	"\u0680" : [ //ڀ
	],
	"\u0681" : [ //ځ
	],
	"\u0682" : [ //ڂ
	],
	"\u0683" : [ //ڃ
	],
	"\u0684" : [ //ڄ
	],
	"\u0685" : [ //څ
	],
	"\u0686" : [ //چ
	],
	"\u0687" : [ //ڇ
	],
	"\u0688" : [ //ڈ
	],
	"\u0689" : [ //ډ
	],
	"\u068A" : [ //ڊ
	],
	"\u068B" : [ //ڋ
	],
	"\u068C" : [ //ڌ
	],
	"\u068D" : [ //ڍ
	],
	"\u068E" : [ //ڎ
	],
	"\u068F" : [ //ڏ
	],
	"\u0690" : [ //ڐ
	],
	"\u0691" : [ //ڑ
	],
	"\u0692" : [ //ڒ
	],
	"\u0693" : [ //ړ
	],
	"\u0694" : [ //ڔ
	],
	"\u0695" : [ //ڕ
	],
	"\u0696" : [ //ږ
	],
	"\u0697" : [ //ڗ
	],
	"\u0698" : [ //ژ
	],
	"\u0699" : [ //ڙ
	],
	"\u069A" : [ //ښ
	],
	"\u069B" : [ //ڛ
	],
	"\u069C" : [ //ڜ
	],
	"\u069D" : [ //ڝ
	],
	"\u069E" : [ //ڞ
	],
	"\u069F" : [ //ڟ
	],
	"\u06A0" : [ //ڠ
	],
	"\u06A1" : [ //ڡ
	],
	"\u06A2" : [ //ڢ
	],
	"\u06A3" : [ //ڣ
	],
	"\u06A4" : [ //ڤ
	],
	"\u06A5" : [ //ڥ
	],
	"\u06A6" : [ //ڦ
	],
	"\u06A7" : [ //ڧ
	],
	"\u06A8" : [ //ڨ
	],
	"\u06A9" : [ //ک
	],
	"\u06AA" : [ //ڪ
	],
	"\u06AB" : [ //ګ
	],
	"\u06AC" : [ //ڬ
	],
	"\u06AD" : [ //ڭ
	],
	"\u06AE" : [ //ڮ
	],
	"\u06AF" : [ //گ
	],
	"\u06B0" : [ //ڰ
	],
	"\u06B1" : [ //ڱ
	],
	"\u06B2" : [ //ڲ
	],
	"\u06B3" : [ //ڳ
	],
	"\u06B4" : [ //ڴ
	],
	"\u06B5" : [ //ڵ
	],
	"\u06B6" : [ //ڶ
	],
	"\u06B7" : [ //ڷ
	],
	"\u06B8" : [ //ڸ
	],
	"\u06B9" : [ //ڹ
	],
	"\u06BA" : [ //ں
	],
	"\u06BB" : [ //ڻ
	],
	"\u06BC" : [ //ڼ
	],
	"\u06BD" : [ //ڽ
	],
	"\u06BE" : [ //ھ
	],
	"\u06BF" : [ //ڿ
	],
	"\u06C0" : [ //ۀ
	],
	"\u06C1" : [ //ہ
	],
	"\u06C2" : [ //ۂ
	],
	"\u06C3" : [ //ۃ
	],
	"\u06C4" : [ //ۄ
	],
	"\u06C5" : [ //ۅ
	],
	"\u06C6" : [ //ۆ
	],
	"\u06C7" : [ //ۇ
	],
	"\u06C8" : [ //ۈ
	],
	"\u06C9" : [ //ۉ
	],
	"\u06CA" : [ //ۊ
	],
	"\u06CB" : [ //ۋ
	],
	"\u06CC" : [ //ی
	],
	"\u06CD" : [ //ۍ
	],
	"\u06CE" : [ //ێ
	],
	"\u06CF" : [ //ۏ
	],
	"\u06D0" : [ //ې
	],
	"\u06D1" : [ //ۑ
	],
	"\u06D2" : [ //ے
	],
	"\u06D3" : [ //ۓ
	],
	"\u06D4" : [ //۔
	],
	"\u06D5" : [ //ە
	],
	"\u06D6" : [ //ۖ
	],
	"\u06D7" : [ //ۗ
	],
	"\u06D8" : [ //ۘ
	],
	"\u06D9" : [ //ۙ
	],
	"\u06DA" : [ //ۚ
	],
	"\u06DB" : [ //ۛ
	],
	"\u06DC" : [ //ۜ
	],
	"\u06DD" : [ //۝
	],
	"\u06DE" : [ //۞
	],
	"\u06DF" : [ //۟
	],
	"\u06E0" : [ //۠
	],
	"\u06E1" : [ //ۡ
	],
	"\u06E2" : [ //ۢ
	],
	"\u06E3" : [ //ۣ
	],
	"\u06E4" : [ //ۤ
	],
	"\u06E5" : [ //ۥ
	],
	"\u06E6" : [ //ۦ
	],
	"\u06E7" : [ //ۧ
	],
	"\u06E8" : [ //ۨ
	],
	"\u06E9" : [ //۩
	],
	"\u06EA" : [ //۪
	],
	"\u06EB" : [ //۫
	],
	"\u06EC" : [ //۬
	],
	"\u06ED" : [ //ۭ
	],
	"\u06EE" : [ //ۮ
	],
	"\u06EF" : [ //ۯ
	],
	"\u06F0" : [ //۰
	],
	"\u06F1" : [ //۱
	],
	"\u06F2" : [ //۲
	],
	"\u06F3" : [ //۳
	],
	"\u06F4" : [ //۴
	],
	"\u06F5" : [ //۵
	],
	"\u06F6" : [ //۶
	],
	"\u06F7" : [ //۷
	],
	"\u06F8" : [ //۸
	],
	"\u06F9" : [ //۹
	],
	"\u06FA" : [ //ۺ
	],
	"\u06FB" : [ //ۻ
	],
	"\u06FC" : [ //ۼ
	],
	"\u06FD" : [ //۽
	],
	"\u06FE" : [ //۾
	],
	"\u06FF" : [ //ۿ
	]*/
	"\uFDF2" : [ //ﷲ
		false,
		false,
		false,
		0x22
	]
};
