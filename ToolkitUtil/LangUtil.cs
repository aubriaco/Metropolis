/*---------------------------------------------------------------------------------------------
 *  Copyright (c) by Solusek Systems. All rights reserved.
 *--------------------------------------------------------------------------------------------*/
 
 using Google.Api.Gax.ResourceNames;
using Google.Cloud.Translate.V3;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Toolkit
{

    public static class LangUtil
    {
        private static string ProjectID = string.Empty;
        public static void Init(string fileName)
        {
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", fileName);

            dynamic? o = JsonConvert.DeserializeObject(File.ReadAllText(fileName));
            if(o == null)
                throw new Exception("Failed to load google config.");


            ProjectID = (string)o.project_id;

            Console.WriteLine("Project ID: " + ProjectID);

        }

        public static string Translate(string inputText, string toLang = "es-ES")
        {
            if (string.IsNullOrEmpty(inputText))
                return inputText;
            var client = TranslationServiceClient.Create();
            var request = new TranslateTextRequest
            {
                Contents = { inputText },
                TargetLanguageCode = toLang,
                Parent = new ProjectName(ProjectID).ToString()
            };
            var response = client.TranslateText(request);
            var translation = response.Translations[0];

            var t = translation.TranslatedText;

            if (inputText[0] >= 'A' && inputText[0] <= 'Z')
            {
                var f = t.Substring(0, 1);
                if (t.Length > 1)
                    t = f.ToUpper() + t.Substring(1);
                else
                    t = f.ToUpper();
            }
            else if (inputText[0] >= 'a' && inputText[0] <= 'z')
            {
                var f = t.Substring(0, 1);
                if (t.Length > 1)
                    t = f.ToLower() + t.Substring(1);
                else
                    t = f.ToLower();
            }
            return t;
        }
    }
}
