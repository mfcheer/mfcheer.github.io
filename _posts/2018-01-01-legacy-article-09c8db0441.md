---
title: 'DFA算法敏感词过滤'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：DFA算法敏感词过滤'
slug: legacy-article-09c8db0441
---

DFA全称为：Deterministic Finite Automaton,即确定有穷自动机。其特征为：有一个有限状态集合和一些从一个状态通向另一个状态的边，每条边上标记有一个符号，其中一个状态是初态，某些状态是终态。但不同于不确定的有限自动机，DFA中不会有从同一状态出发的两条边标志有相同的符号。常常应用于敏感词过滤，具体的细节原理可以在网上搜到很多，这里就不具体说了。

下面给出简单的实现。

简单实现代码：

<!--more-->
```
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;


public class DFA {
	
	public static Map<String,String> sensitiveWordsMap = new HashMap<String, String>();  
	
	public void addSensitiveWords(Set<String> wordSet){ 
        for (String word : wordSet) {  
            Map nowMap = sensitiveWordsMap;  
            for (int i = 0; i < word.length(); i++) {  
                char keyChar = word.charAt(i);  
                Object nextMap = nowMap.get(keyChar);  
                if (nextMap != null) {
                    nowMap = (Map<String,String>) nextMap;  
                }else {  
                    Map<String, String> newMap = new HashMap<String, String>();  
                    newMap.put("isEnd", "0");  
                    nowMap.put(keyChar, newMap);  
                    nowMap = newMap;  
                } 
                
                if (i == word.length() - 1) {  
                    nowMap.put("isEnd", "1");  
                }
            }  
        }
	}
	
	 public boolean isSensitiveWord(String word) {  
	        Map nowMap = sensitiveWordsMap;
	        
	        for(int i=0;i<word.length();i++){
	        	char keyChar = word.charAt(i);
	        	nowMap = (Map) nowMap.get(keyChar);
	        	if(nowMap == null)
	        		return false;
	        	if(nowMap.get("isEnd").equals("1")){
	        		return true;
	        	}
	        }
			return false;
	}   
	
	public boolean isContainSensitiveWord(String txt){
		for(int i=0; i < txt.length(); i++){
			String subTxt = txt.substring(i);
			if(isSensitiveWord(subTxt))
				return true;
		}
		return false;
	}
	 
	public static void main(String[] args){
		Set<String> wordSet = new HashSet<String>();
		wordSet.add("赌博");
		wordSet.add("赌博赌博");
		wordSet.add("嫖娼");
		wordSet.add("毒品");
		wordSet.add("枪支");
		
		DFA dfa = new DFA();
		//添加敏感词
		dfa.addSensitiveWords(wordSet);
		System.out.println(sensitiveWordsMap.toString());
		
		//查询测试
		System.out.println(dfa.isContainSensitiveWord("赌博"));
		System.out.println(dfa.isContainSensitiveWord("赌博赌"));
		System.out.println(dfa.isContainSensitiveWord("博赌"));
		System.out.println(dfa.isContainSensitiveWord("赌&博"));
		System.out.println(dfa.isContainSensitiveWord("赌博不许"));
		System.out.println(dfa.isContainSensitiveWord("不许赌博"));
		System.out.println(dfa.isContainSensitiveWord("&赌博&嫖娼&毒品&枪支&"));
 	}
}
/*
{枪={支={isEnd=1}, isEnd=0}, 赌={isEnd=0, 博={isEnd=1, 赌={isEnd=0, 博={isEnd=1}}}}, 
嫖={isEnd=0, 娼={isEnd=1}}, 毒={品={isEnd=1}, isEnd=0}}
true
true
false
false
true
true
true
*/
```