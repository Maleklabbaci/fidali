export async function exportDashboardPDF(data: {
  merchantName: string
  businessName: string
  plan: string
  stats: any
  clients: any[]
  cards: any[]
  dateRange?: string
}) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  // Header
  doc.setFillColor(30, 58, 95)
  doc.rect(0, 0, pageWidth, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text('Fidali', 14, 18)
  doc.setFontSize(10)
  doc.text(`Rapport — ${data.businessName}`, 14, 28)
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 35)
  doc.text(`Plan: ${data.plan.toUpperCase()}`, pageWidth - 14, 28, { align: 'right' })

  y = 55

  // Stats
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.text('Statistiques', 14, y)
  y += 10

  const statsData = [
    ['Clients totaux', String(data.stats?.total_clients || 0)],
    ['Cartes actives', String(data.cards?.length || 0)],
    ['Points distribués', String(data.stats?.total_points_distributed || data.stats?.total_active_points || 0)],
    ['Récompenses données', String(data.stats?.total_rewards || 0)],
  ]

  autoTable(doc, {
    startY: y,
    head: [['Métrique', 'Valeur']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 95] },
    margin: { left: 14, right: 14 },
  })

  y = (doc as any).lastAutoTable.finalY + 15

  // Cards
  doc.setFontSize(16)
  doc.text('Cartes de fidélité', 14, y)
  y += 10

  if (data.cards.length > 0) {
    const cardsTableData = data.cards.map((c: any) => [
      c.business_name,
      c.code,
      String(c.max_points),
      c.reward,
      c.points_rule,
    ])

    autoTable(doc, {
      startY: y,
      head: [['Commerce', 'Code', 'Points max', 'Récompense', 'Règle']],
      body: cardsTableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 95] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
    })

    y = (doc as any).lastAutoTable.finalY + 15
  }

  // Clients
  if (y > 230) { doc.addPage(); y = 20 }

  doc.setFontSize(16)
  doc.text('Top Clients', 14, y)
  y += 10

  if (data.clients.length > 0) {
    const clientsTableData = data.clients.slice(0, 20).map((c: any) => [
      c.client_name,
      c.client_phone || '',
      `${c.points}/${c.max_points}`,
      `${Math.round((c.points / (c.max_points || 1)) * 100)}%`,
      String(c.total_rewards_redeemed || 0),
    ])

    autoTable(doc, {
      startY: y,
      head: [['Client', 'Téléphone', 'Points', 'Progression', 'Récompenses']],
      body: clientsTableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 95] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
    })
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Fidali — Rapport ${data.businessName} — Page ${i}/${totalPages}`,
      pageWidth / 2, doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Save
  const fileName = `fidali-rapport-${data.businessName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
