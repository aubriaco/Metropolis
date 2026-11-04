#!/bin/sh
dotnet ../bin/Release/net10.0/Toolkit.dll process-html '../../Marketplace/views-src'
dotnet ../bin/Release/net10.0/Toolkit.dll translate-html '../../Marketplace/views-src' '../../Marketplace/wwwroot/lang/dict.json'
cp ../../Marketplace/wwwroot/lang/dict.json dict.json.bak
cp dict.json ../../Marketplace/wwwroot/lang/dict.json