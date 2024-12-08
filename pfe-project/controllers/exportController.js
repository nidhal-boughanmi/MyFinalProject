const PDFDocument = require('pdfkit');
const Excel = require('exceljs');

exports.exportToPdf = async (req, res) => {
    try {
        const { data } = req.body;
        const doc = new PDFDocument();

        // Configuration de l'en-tête de réponse
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=rapport.pdf');

        // Pipe le PDF directement vers la réponse
        doc.pipe(res);

        // En-tête du document
        doc.fontSize(25).text('Rapport Administratif', 100, 80);
        doc.fontSize(15).text(`Généré le ${new Date().toLocaleDateString()}`, 100, 120);

        // Statistiques générales
        doc.fontSize(20).text('Statistiques Générales', 100, 180);
        if (data.stats) {
            doc.fontSize(12).text(`Total Stations: ${data.stats.totalStations || 0}`, 120, 210);
            doc.text(`Stations Actives: ${data.stats.activeStations || 0}`, 120, 230);
            doc.text(`Total Commandes: ${data.stats.totalCommandes || 0}`, 120, 250);
            doc.text(`Commandes en Cours: ${data.stats.commandesEnCours || 0}`, 120, 270);
        }

        // Réclamations
        doc.fontSize(20).text('Réclamations', 100, 320);
        if (data.reclamations && data.reclamations.length > 0) {
            let y = 350;
            data.reclamations.forEach((reclamation, index) => {
                if (y > 700) { // Nouvelle page si nécessaire
                    doc.addPage();
                    y = 50;
                }
                doc.fontSize(12)
                    .text(`ID: ${reclamation.idReclamation}`, 120, y)
                    .text(`Type: ${reclamation.type}`, 120, y + 20)
                    .text(`État: ${reclamation.etat}`, 120, y + 40);
                y += 80;
            });
        }

        // Finaliser le document
        doc.end();
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        res.status(500).json({ message: 'Erreur lors de la génération du PDF' });
    }
};

exports.exportToExcel = async (req, res) => {
    try {
        const { data } = req.body;
        const workbook = new Excel.Workbook();
        
        // Feuille des statistiques
        const statsSheet = workbook.addWorksheet('Statistiques');
        statsSheet.columns = [
            { header: 'Métrique', key: 'metric' },
            { header: 'Valeur', key: 'value' }
        ];

        if (data.stats) {
            statsSheet.addRows([
                { metric: 'Total Stations', value: data.stats.totalStations || 0 },
                { metric: 'Stations Actives', value: data.stats.activeStations || 0 },
                { metric: 'Total Commandes', value: data.stats.totalCommandes || 0 },
                { metric: 'Commandes en Cours', value: data.stats.commandesEnCours || 0 }
            ]);
        }

        // Feuille des réclamations
        const reclamationsSheet = workbook.addWorksheet('Réclamations');
        reclamationsSheet.columns = [
            { header: 'ID', key: 'id' },
            { header: 'Type', key: 'type' },
            { header: 'Description', key: 'description' },
            { header: 'État', key: 'etat' },
            { header: 'Date', key: 'date' }
        ];

        if (data.reclamations && data.reclamations.length > 0) {
            reclamationsSheet.addRows(
                data.reclamations.map(r => ({
                    id: r.idReclamation,
                    type: r.type,
                    description: r.description,
                    etat: r.etat,
                    date: new Date(r.date).toLocaleDateString()
                }))
            );
        }

        // Configuration de l'en-tête de réponse
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=rapport.xlsx');

        // Envoyer le workbook
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Erreur lors de la génération du fichier Excel:', error);
        res.status(500).json({ message: 'Erreur lors de la génération du fichier Excel' });
    }
};
