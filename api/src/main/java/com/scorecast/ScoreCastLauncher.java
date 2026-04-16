package com.scorecast;

import java.awt.*;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URI;
import java.util.concurrent.CountDownLatch;

/**
 * Launcher que inicia o Spring Boot e adiciona ícone na system tray do Windows.
 * O ícone permite abrir o app no navegador ou encerrar a aplicação.
 */
public class ScoreCastLauncher {

    private static final String APP_NAME = "Score Cast";
    private static final String APP_URL = "http://localhost:8080";
    private static TrayIcon trayIcon;
    private static CountDownLatch latch = new CountDownLatch(1);

    public static void main(String[] args) throws Exception {
        // Inicia o Spring Boot em uma thread separada
        Thread springThread = new Thread(() -> {
            org.springframework.boot.SpringApplication.run(ScoreCastApplication.class, args);
        });
        springThread.start();

        // Espera o servidor iniciar
        Thread.sleep(5000);

        // Configura o system tray (apenas no Windows)
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            setupSystemTray();
        } else {
            // Em Linux, apenas espera até Ctrl+C
            System.out.println("\n" + "=".repeat(50));
            System.out.println("Score Cast iniciado!");
            System.out.println("Acesse: " + APP_URL);
            System.out.println("Pressione Ctrl+C para encerrar.");
            System.out.println("=".repeat(50) + "\n");
        }

        // Mantém a aplicação rodando
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("\nEncerrando Score Cast...");
            if (trayIcon != null) {
                SystemTray.getSystemTray().remove(trayIcon);
            }
        }));

        latch.await();
    }

    private static void setupSystemTray() {
        try {
            // Tenta carregar ícone da aplicação (vai usar ícone padrão se não encontrar)
            Image icon = Toolkit.getDefaultToolkit().getImage(
                ScoreCastLauncher.class.getResource("/tray-icon.png")
            );
            
            // Se ícone não existir, cria um simples
            if (icon.getWidth(null) <= 0) {
                icon = createDefaultIcon();
            }

            trayIcon = new TrayIcon(icon, APP_NAME);
            trayIcon.setToolTip(APP_NAME);

            // Menu de contexto
            PopupMenu menu = new PopupMenu();
            
            MenuItem openItem = new MenuItem("Abrir no navegador");
            openItem.addActionListener(e -> openBrowser());
            menu.add(openItem);
            
            menu.addSeparator();
            
            MenuItem exitItem = new MenuItem("Encerrar");
            exitItem.addActionListener(e -> {
                latch.countDown();
            });
            menu.add(exitItem);

            trayIcon.setPopupMenu(menu);
            
            // Clique duplo abre o navegador
            trayIcon.addMouseListener(new MouseListener() {
                @Override
                public void mouseClicked(MouseEvent e) {
                    if (e.getClickCount() == 2) {
                        openBrowser();
                    }
                }
                @Override public void mousePressed(MouseEvent e) {}
                @Override public void mouseReleased(MouseEvent e) {}
                @Override public void mouseEntered(MouseEvent e) {}
                @Override public void mouseExited(MouseEvent e) {}
            });

            SystemTray.getSystemTray().add(trayIcon);

            // Abre o navegador automaticamente ao iniciar
            openBrowser();

            System.out.println("\n" + "=".repeat(50));
            System.out.println("Score Cast iniciado!");
            System.out.println("Ícone na bandeja do sistema: " + APP_NAME);
            System.out.println("Acesse: " + APP_URL);
            System.out.println("Clique com botão direito no ícone para opções.");
            System.out.println("=".repeat(50) + "\n");

        } catch (Exception e) {
            System.err.println("Erro ao configurar system tray: " + e.getMessage());
            System.out.println("\n" + "=".repeat(50));
            System.out.println("Score Cast iniciado!");
            System.out.println("Acesse: " + APP_URL);
            System.out.println("Pressione Ctrl+C para encerrar.");
            System.out.println("=".repeat(50) + "\n");
        }
    }

    private static void openBrowser() {
        try {
            Desktop.getDesktop().browse(new URI(APP_URL));
        } catch (Exception e) {
            System.err.println("Erro ao abrir navegador: " + e.getMessage());
        }
    }

    private static Image createDefaultIcon() {
        // Cria um ícone simples 16x16
        BufferedImage img = new BufferedImage(16, 16, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = img.createGraphics();
        g.setColor(new Color(34, 197, 94)); // verde
        g.fillOval(1, 1, 14, 14);
        g.setColor(Color.WHITE);
        g.setFont(new Font("Arial", Font.BOLD, 10));
        g.drawString("S", 4, 12);
        g.dispose();
        return img;
    }
}