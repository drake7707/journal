﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Journal.Models;
using Journal.Domain;

namespace Journal.Controllers
{
    [Route("/")]
    public class HomeController : Controller
    {
    
        private readonly DALManager dalManager;

        public HomeController(DALManager dalManager)
        {
            this.dalManager = dalManager;
        }

        [HttpGet("")]
        public IActionResult Index(string? day)
        {
            JournalModel model = new JournalModel()
            {
                AvailableDates = dalManager.GetAllEntryDates(),
                AvailableTags = dalManager.GetTags().Select(t => t.Tag).ToArray()
            };

            return View(model);
        }

        [HttpGet("photo")]
        public IActionResult Photo()
        {
            return View();
        }

        [HttpGet("search")]
        public IActionResult Search()
        {
            return View();
        }


        [HttpGet("tags")]
        public IActionResult Tags()
        {
            return View(dalManager.GetTags());
        }

        [HttpGet("tag")]
        public IActionResult Tag(string tag)
        {
            ViewBag.Title = tag;
            var model = dalManager.GetEntriesByTag(tag);
            return View(model);
        }


        [HttpGet("mood")]
        public IActionResult Mood()
        {
            return View(dalManager.GetEntries());
        }

        [HttpGet("year")]
        public IActionResult Year()
        {
            return View();
        }

        [HttpGet("gallery")]
        public IActionResult Gallery()
        {
            var model = dalManager.GetEntries().Where(e => e.ImageCount > 0).OrderByDescending(e => e.Day).ToList();
            return View(model);
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet("error")]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
