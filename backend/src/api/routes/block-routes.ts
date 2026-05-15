import { Router } from "express";
import { ZodError, ZodIssue } from "zod"; 
import { checkRole } from "./middlewares/role-middleware";
import { insertBlockSchema } from "../../db/validation";
import { blockService } from "../../services/block-service";
import { auth } from "../../utils/auth"; 
import { fromNodeHeaders } from "better-auth/node";

const router = Router();


/*CRUD blocks*/
//GET /:courseId/blocks - hämtar alla block i en specifik kurs
router.get("/:courseId/blocks", async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      res.status(400).json({ error: "Invalid course ID" });
      return;
    }
    const allBlocks = await blockService.getAllBlocks(courseId);
    if (!allBlocks) {
      res.status(404).json({ error: "Blocks not found" });
      return;
    }
    res.status(200).json({
      message: "Hämtade alla block i kursen", 
      blocks: allBlocks
    }) 
  } catch (error) {
    console.error("Fel vid hämtningen av block", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//GET /:courseId/blocks/:blockId - hämtar alla block i en specifik kurs
router.get("/:courseId/blocks/:blockId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const blockId = parseInt(req.params.blockId);
    if (isNaN(blockId)) {
      res.status(400).json({ error: "Invalid block ID" });
      return;
    }
    const oneBlock = await blockService.getOneBlock(blockId, Number(courseId));
    if (!oneBlock) {
      res.status(404).json({ error: "Block not found" });
      return;
    }
    res.status(200).json({
      message: "Hämtade blocket från kursen", 
      block: oneBlock
    }) 
  } catch (error) {
    console.error("Fel vid hämtningen av block", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//POST /:courseId/blocks - Skapar ett block
router.post("/:courseId/blocks", checkRole(["admin", "creator"]),async (req, res) => {
    const courseId = req.params.courseId;

    try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        });
        // Lägg till kontroll för session och userId
        if (!session || !session.user || !session.user.id) {
          res.status(401).json({ error: "Unauthorized - User session not found" });
          return;
        }
        const validatedData = insertBlockSchema.parse(req.body);
        const userId = session.user.id;
        const data = { courseId: Number(courseId), userId, ...validatedData };
        
        const createOneBlock = await blockService.createBlock(data);

        res.status(201).json({ message: "Blocket har skapats!", block: createOneBlock});
    } catch (error) {
        console.error("Fel vid skapandet av ny block:", error);
        res.status(500).json({ error: "Kunde inte skapa en nytt block" });
    }
});

//PATCH /:courseId/blocks/:blockId - uppdaterar block
router.patch("/:courseId/blocks/:blockId", checkRole(["admin", "creator"]), async (req, res) => {
    const { blockId, courseId } = req.params;
    const data = { blockId: Number(blockId), courseId: Number(courseId) };

    try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        });
        // Lägg till kontroll för session och userId
        if (!session || !session.user || !session.user.id) {
          res.status(401).json({ error: "Unauthorized - User session not found" });
          return;
        }

        const validatedData = insertBlockSchema.partial().parse(req.body);
        const updateOneBlock = await blockService.updateBlock(
          data.blockId,
          data.courseId,
          session.user.id,
          validatedData
        );

        if (!updateOneBlock) {
            return res.status(404).json({
                error: "Blocket hittades inte"
            });
        }

        res.status(200).json({
            message: "Blocket har uppdaterats",
            block: updateOneBlock,
        });

    } catch (error) {
        if(error instanceof ZodError) {
          return res.status(400).json({
            error: "Validation failed",
            details: error.issues.map((e: ZodIssue) => ({ // Ändrade från errors till issues
              path: e.path,
              message: e.message 
            }))
          });
        }

        console.error("Fel vid uppdatering av blocket:", error);
        res.status(500).json({ error: "Kunde inte uppdatera blocket pga internt serverfel" });
    }
});

//DELETE /:courseId/blocks/:blockId - Tar bort ett block
router.delete("/:courseId/blocks/:blockId", checkRole(["admin", "creator"]),async (req, res) => {
    const { blockId, courseId } = req.params;

    try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        });
        // Lägg till kontroll för session och userId
        if (!session || !session.user || !session.user.id) {
          res.status(401).json({ error: "Unauthorized - User session not found" });
          return;
        }

        const deleteOneBlock = await blockService.deleteBlock(
          Number(blockId), 
          Number(courseId),
          session.user.id
        );
        res.status(200).json({
          message : "Blocket har tagits bort!", 
          block: deleteOneBlock
        });
    } catch (error) {
        console.error("Fel vid borttagning av ett block:", error);
        res.status(500).json({ error: "Kunde inte ta bort blocket" });
    }
});

/* 

router.post("/", checkRole(["admin", "creator"]), async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    // Lägg till kontroll för session och userId
    if (!session || !session.user || !session.user.id) {
      res.status(401).json({ error: "Unauthorized - User session not found" });
      return;
    }

    const validatedData = insertBlockSchema.parse(req.body);

    // Returnera svar med Express-syntax
    const newBlock = await blockService.createBlock({
      ...validatedData, 
      userId: session.user.id, // Använd session.user.id direkt
    })

    //Returnera svar med Express-syntax
    res.status(201).json(newBlock);
  } catch (error) {
    if(error instanceof ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((e: ZodIssue) => ({ // Ändrade från errors till issues
          path: e.path,
          message: e.message 
        }))
      }); 
      return;
    }
    console.error("Fel vid skapande av kurs", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

*/

export default router;


/*

Felmeddelanden ska innehålla:
- en HTTP-statuskod, ex status: 404 
- ett maskinläsbart felkod-fält, ex error: "PAGE_NOT_FOUND"
- och ett mänskligt läsbart meddelande, ex message: "Sidan finns inte"


*/