function convert(){var e=document.getElementById("input").value;try{var r=(convertSQL(e)+"\n->get();").trim();r=markUp(r);var t="get</span><span style='color:gray'>(</span><span style='color:gray'>)</span><span style='color:gray'>;</span>";document.getElementById("result").innerHTML=r.split(t)[0]+t}catch(e){console.log(e.message),document.getElementById("result").innerHTML="Cannot parse your SQL Statement. Please check your syntax. \nPlease note, only SELECT statements are considered valid syntax.\n\nRules: \n1. Use parentheses when using BETWEEN operator. \n\te.g. \n\tSELECT * FROM t WHERE (column_name BETWEEN value1 AND value2);\n2. When using ALIAS, always use the AS linking verb. \n\te.g. \n\tSELECT uid AS `user_id`;\n3. Always use backticks (`) for aliases."}}function convertSQL(e,r=!1){if(!e.toLowerCase().includes("select")||!e.toLowerCase().includes("from"))throw"Syntax Error";if(!window.location.href.includes("jjlabajo"))throw"error";e=(e=(e=(e=(e=(e=(e=e.toLowerCase().trim()).replace(/;/g,"")).replace(/"/g,"'")).replace(/,/g,", ")).replace(/in\(/g,"in (")).replace(/(\r\n|\n|\r)/gm," ")).replace(/\s+/gm," "),r&&(e=e.trim().replace(/^\(/g,"").replace(/\)$/g,""));var t=getAll(/case when (.+?) end (.+?)`(.+?)`/g,e);select_raws=t.matches,e=(t=getAll(/(([a-z]|[a-z]_[a-z])+?| )\(.+?\)( | as)`.+?`/g,e=t.input,"select_subquery_function")).input,select_subqueries_functions=t.result,e=(t=getAll(/( *?\(.+?\))/g,e,"where_subquery_group")).input,where_subqueries_groups=t.result;var i=(e=e.replace(/\s+/gm," ")).split(/select | from | where | order by | limit /);return compose({select:i[1]||"",from:i[2]||"",where:i[3]||"",order_by:i[4]||"",limit:i[5]||""},select_raws,select_subqueries_functions,where_subqueries_groups,r)}function compose(e,r,t,i,n){var o,s=i,a=[],l="\n",c=e.from.split(/left join|right join|inner join|full join|cross join|join/);o=c[0].trim(),n?(a.push(`$query->from("${o}")`),l="\n\t"):a.push(`DB::table("${o}")`);var u=0;for(table_clause of c)0!=u?(a.push(join(table_clause,e.from.trim().match(/left join|right join|inner join|full join|cross join|join/g),u-1,s)),u++):u++;var p=e.select.split(",").filter(e=>!e.trim().includes("select_subquery_function")&&""!=e.trim()).map(function(e){return`${e.trim()}`}).join(", ");for(column of("*"!=p&&a.push(`->addSelect(DB::raw("${changeGroups(p,s)}"))`),r))column=column.trim(),a.push(`->addSelect(DB::raw("${column}"))`);for(column of e.select.split(","))column=column.trim(),column.includes("select_subquery_function")&&(value=t[` ${column}`]||"",value=value.trim(),""!=value&&(/^\(.+?/g.test(value)?(alias=getAlias(value),""!=alias&&a.push(`->addSelect(["${alias}" => ${getSubquery(value)}])`)):a.push(`->addSelect(DB::raw("${value}"))`)));if(""!=e.where.trim())for(condition of(first_condition=e.where.split(/and|or/)[0].trim(),""!=first_condition&&a.push(where(first_condition,s)),get_all=getAll(/ and | or /g,e.where.replace(first_condition,"").trim()),operators=get_all.matches,conditions=e.where.trim().split(/ and | or /g).map(function(e){return e.trim()}),u=0,conditions))if(0!=u){pre="or"==(operators[u-1]||"")?"orWhere":"where";try{a.push(where(condition,s,pre))}catch(e){console.log(u,conditions)}u++}else u++;return""!=e.order_by.trim()&&a.push(`->orderBy(${e.order_by.split(" ").map(function(e){return`"${e}"`}).join(",")})`),""!=e.limit.trim()&&(limit=e.limit.trim(),/offset|,/g.test(limit)?(parts=limit.split(/offset|,/g),/offset/g.test(limit)?(void 0!==parts[1]&&a.push(`->offset(${(parts[1]||"").trim()})`),a.push(`->limit(${parts[0].trim()})`)):(a.push(`->offset(${parts[0].trim()})`),void 0!==parts[1]&&a.push(`->limit(${(parts[1]||"").trim()})`))):a.push(`->limit(${limit})`)),n?a.join(l)+";":a.join(l)}function changeGroups(e,r){var t=/where_subquery_group_(\d+)/g;if(t.test(e)&&(matches=e.match(t),Array.isArray(matches)))for(match of matches)void 0!==r[` ${match}`]&&(e=e.replace(match,r[` ${match}`].trim()).trim());return e}function join(e,r,t,i){if(Array.isArray(r)||(r=[]),void 0!==(r=r.map(function(e){return e.trim()}))[t]){var n=r[t].replace(/^(.)|\s+(.)/g,function(e){return e.toUpperCase()});n=lowerCaseFirstLetter(n=n.replace(/ /g,""));var o=e.split(/on/g)[0].trim();if("crossJoin"==n){if(regex=/where_subquery_group_(\d+)/g,regex.test(e)&&(matches=e.match(regex),Array.isArray(matches)))for(match of matches)void 0!==i[` ${match}`]&&(e=e.replace(match,i[` ${match}`].trim()).trim());return`->${n}(DB::raw("${e}"))`}return`->${n}("${o}", function($join){\n\t${joinCondition(e.replace(o,"").trim(),i)}\n})`}return""}function joinCondition(e,r){var t=[],i=(e=e.replace(/on/g,"")).split(/ and | or /g)[0].trim();""!=i&&t.push(conditionOn(i,r));var n=getAll(/ and | or /g,e.replace(i,"").trim());operators=n.matches;var o=e.trim().split(/ and | or /g).map(function(e){return e.trim()});for(condition of(x=0,o))if(0!=x){if(1==x){pre="or"==(operators[x-1]||"")?"orOn":"on";try{t.push(conditionOn(condition,r,pre))}catch(e){console.log(x,o),t.push(`->${pre}(DB::raw("${condition}"))`)}}else{pre="or"==(operators[x-1]||"")?"orWhere":"where";try{t.push(where(condition,r,pre))}catch(e){console.log(x,o),t.push(`->${pre}(DB::raw("${condition}"))`)}}x++}else x++;return"$join"+t.join("\n\t")+";"}function conditionOn(e,r,t="on"){var i=e.split(" ");return void 0===i[1]&&void 0!==r[` ${i[0].trim()}`]?`->${t}(DB::raw(${r[` ${i[0]}`].trim()}))`:(last=`"${i[2].trim()}"`,(i[2].trim().startsWith("'")&&i[2].trim().endsWith("'")||i[2].trim().startsWith('"')&&i[2].trim().endsWith('"'))&&(last=i[2].trim()),e.includes("where_subquery_group")&&(condition=r[` ${i[2].trim()}`].trim(),/^(\(select|\( select)/g.test(condition)?last=getSubquery(condition):last="["+r[` ${i[2]}`].trim().replace(/^\(/g,"").replace(/\)$/g,"")+"]"),"in"==i[1].trim()?`->${t}In("${i[0]}", ${last})`:"is"==i[1].trim()||"between"==i[1].trim()?`->${t}(DB::raw("${e}"))`:`->${t}("${i[0]}", "${i[1]}", ${last})`)}function lowerCaseFirstLetter(e){return e.charAt(0).toLowerCase()+e.slice(1)}function where(e,r,t="where"){var i=e.split(" "),n=e,o=`"${n.split(" ")[0]||""}", "${n.split(" ")[1]||""}"`;return void 0===i[1]&&void 0!==r[` ${i[0].trim()}`]?`->${t}(DB::raw(${r[` ${i[0]}`].trim()}))`:(last=`"${i[2]}"`,e.includes("where_subquery_group")&&(condition=r[` ${i[2].trim()}`].trim(),/^(\(select|\( select)/g.test(condition)?last=getSubquery(condition):last="["+r[` ${i[2]}`].trim().replace(/^\(/g,"").replace(/\)$/g,"")+"]"),"in"==i[1].trim()?`->${t}In("${i[0]}", ${last})`:/is null/g.test(e)?`->${t}Null("${i[0]}")`:/is not null/g.test(e)?`->${t}NotNull("${i[0]}")`:`->${t}(${o}, ${last})`)}function getSubquery(e){return`function($query){\n\t${convertSQL(e=e.replace(/`(.+?)`$/g,""),!0)}\n}`}function getAlias(e){var r=(e=e.trim()).match(/`.+?`$/g);return Array.isArray(r)||(r=[]),(r[0]||"").replace(/`/g,"").trim()}function getAll(e,r,t=""){var i={},n=r.match(e);Array.isArray(n)||(n=[]);var o=1;for(match of n)replace=` ${t}_${o}_`,""==t&&(replace=""),r=r.replace(match,replace),i[replace]=match,o++;return{result:i,input:r,matches:n}}function markUp(e){var r=e.match(/"(.+?)"/g);Array.isArray(r)||(r=[]);var t={},i=1;for(string of r)key=`quoted_string_${i}_`,t[key]=string,e=e.replace(string,key),i++;for(key in e=(e=(e=(e=(e=(e=e.replace(/(>|::|:)(\D+?)(\()/g,"$1<span class='g'>$2</span>$3")).replace(/(::|->)/g,"<span class='r'>$1</span>")).replace(/(function)/g,"<i class='b'>$1</i>")).replace(/(DB)/g,"<span class='b'>$1</span>")).replace(/(\(|\)|"|,|\[|\]|;|\{|\})/g,"<span style='color:gray'>$1</span>")).replace(/(\$[a-z]+)/g,"<span style='color:white'>$1</span>"),t){string=t[key];var n=new RegExp(key,"g");e=e.replace(n,`<span style='color:#FFFCB2;'>${string}</span>`)}return e}